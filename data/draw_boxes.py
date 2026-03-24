import argparse
import cv2
import pandas as pd
import os

def parse_args():
    parser = argparse.ArgumentParser(description='Draw bounding boxes on image from RetinaNet CSV.')
    parser.add_argument('--image', help='Path to input image', required=True)
    parser.add_argument('--csv', help='Path to output CSV from inference', required=True)
    parser.add_argument('--output', help='Path to save annotated image', default='annotated_drone.jpg')
    return parser.parse_args()

def main():
    args = parse_args()

    if not os.path.exists(args.image):
        print(f"Error: Image {args.image} not found.")
        return
        
    if not os.path.exists(args.csv):
        print(f"Error: CSV file {args.csv} not found.")
        return

    # Read image
    image = cv2.imread(args.image)
    if image is None:
        print(f"Error: Could not load image {args.image}.")
        return

    # Read CSV
    try:
        df = pd.read_csv(args.csv)
    except Exception as e:
        print(f"Error reading CSV {args.csv}: {e}")
        return

    # Loop through rows and draw boxes
    if not df.empty:
        for idx, row in df.iterrows():
            try:
                xmin = int(round(row['xmin']))
                ymin = int(round(row['ymin']))
                xmax = int(round(row['xmax']))
                ymax = int(round(row['ymax']))
                confidence = float(row['confidence'])
                
                # Draw bright bounding box (BGR format)
                color = (0, 0, 255) # Red as per the user's earlier preference for bright boxes
                thickness = 2
                cv2.rectangle(image, (xmin, ymin), (xmax, ymax), color, thickness)
                
                # Add confidence score label above the box
                label = f"{confidence:.2f}"
                font = cv2.FONT_HERSHEY_SIMPLEX
                font_scale = 0.6
                text_thickness = 2
                
                # Calculate text size to determine positioning
                (text_width, text_height), baseline = cv2.getTextSize(label, font, font_scale, text_thickness)
                
                # Draw text background
                cv2.rectangle(image, (xmin, ymin - text_height - 5), (xmin + text_width, ymin), color, -1)
                
                # Put text (black text on green background for readability)
                cv2.putText(image, label, (xmin, ymin - 5), font, font_scale, (0, 0, 0), text_thickness)
            except Exception as e:
                print(f"Warning: skipped row {idx} due to error: {e}")

    # Save the annotated image (headless, no cv2.imshow)
    cv2.imwrite(args.output, image)
    print(f"Successfully processed {len(df)} bounding boxes.")
    print(f"Saved annotated image to {args.output}")

if __name__ == '__main__':
    main()
