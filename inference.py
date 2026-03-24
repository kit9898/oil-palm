import argparse
import os
import sys
import numpy as np
import cv2
import pandas as pd

# Suppress verbose TF warnings for headless runs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import tensorflow as tf

# Import keras_retinanet for bounding box logic and models
from keras_retinanet import models
from keras_retinanet.utils.image import read_image_bgr, preprocess_image, resize_image

def parse_args():
    parser = argparse.ArgumentParser(description='Headless OPTIMAL-IPB RetinaNet Inference on Jetson')
    parser.add_argument('--model', help='Path to Resnet101.h5 model weights', required=True)
    parser.add_argument('--image', help='Path to input image', required=True)
    parser.add_argument('--output', help='Path to output CSV file', default='output.csv')
    parser.add_argument('--confidence', help='Confidence threshold (0.0 to 1.0)', type=float, default=0.5)
    return parser.parse_args()

def main():
    args = parse_args()

    # 1. Load the Model
    # Workaround for TF 2.3.0 models running on newer JetPack TF versions (e.g., 2.11):
    # Using compile=False bypasses optimizer incompatibility since we only need the network forward pass.
    print(f"Loading RetinaNet model from {args.model}...")
    try:
        # Standard load attempt via wrapper
        model = models.load_model(args.model, backbone_name='resnet101')
    except Exception as e:
        print(f"Standard keras_retinanet load failed: {e}")
        print("Attempting backwards-compatibility fallback load (compile=False)...")
        try:
            from keras_retinanet import custom_objects
            model = tf.keras.models.load_model(
                args.model, 
                custom_objects=custom_objects.retinanet_custom_objects(), 
                compile=False
            )
        except Exception as e2:
            print(f"Fatal error loading model: {e2}")
            sys.exit(1)

    # 2. Assert Inference Model
    # A RetinaNet training model outputs raw regressor/classifier tensors. 
    # An inference model runs Non-Maximum Suppression (NMS) and outputs bounding boxes.
    try:
        if not any([layer.name.startswith('filter_detections') for layer in model.layers]):
            print("Detected raw training model. Adding NMS layers to convert to inference model...")
            model = models.convert_model(model)
    except Exception as e:
        print(f"Warning during model conversion check: {e}")
        
    print("Model initialized and ready.")

    # 3. Process the Image
    print(f"Preprocessing image: {args.image}...")
    try:
        image = read_image_bgr(args.image)
    except Exception as e:
        print(f"Failed to read image {args.image}: {e}")
        sys.exit(1)
        
    # Apply standard keras-retinanet ImageNet color transformations
    image_pre = preprocess_image(image.copy())
    image_pre, scale = resize_image(image_pre)

    # 4. Neural Network Forward Pass 
    print("Running GPU inference (this may take longer on the first pass due to engine warm-up)...")
    # predict_on_batch is highly optimized for single image passes on edge hardware
    preds = model.predict_on_batch(np.expand_dims(image_pre, axis=0))
    
    # Keras-retinanet typically returns: (boxes, scores, labels)
    boxes, scores, labels = preds[:3]

    # Rescale bounding boxes back to the original image dimensions
    boxes /= scale

    # 5. Extract Valid Detections
    results = []
    for box, score, label in zip(boxes[0], scores[0], labels[0]):
        # The scores output array is always sorted descending
        if score < args.confidence:
            break
            
        b = box.astype(int)
        results.append({
            'label': int(label),
            'confidence': float(score),
            'xmin': b[0],
            'ymin': b[1],
            'xmax': b[2],
            'ymax': b[3]
        })

    # 6. Save Bounding Boxes and Counts to CSV
    df = pd.DataFrame(results)
    if df.empty:
        df = pd.DataFrame(columns=['label', 'confidence', 'xmin', 'ymin', 'xmax', 'ymax'])
    
    df.to_csv(args.output, index=False)
    print(f"Detection successful. Found {len(df)} palms.")
    print(f"Saved inference results to {args.output}")

if __name__ == '__main__':
    main()
