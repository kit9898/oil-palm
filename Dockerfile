# Dockerfile for OPTIMAL-IPB Headless Inference on NVIDIA Jetson Orin Nano
# Base image: NVIDIA L4T Machine Learning container (JetPack 5 / L4T 35.x)
# This includes TensorFlow 2.11 tightly bound to CUDA 11.4 / cuDNN 8.6 for Jetson.
FROM nvcr.io/nvidia/l4t-ml:r35.2.1-py3

ENV DEBIAN_FRONTEND=noninteractive

# Update and install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    wget \
    git \
    libgl1-mesa-glx \
    libglib2.0-0 \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Fix for missing libffi.so.8 when JetPack 5 containers run on JetPack 6 (Ubuntu 22.04) hosts
RUN wget http://ports.ubuntu.com/pool/main/libf/libffi/libffi8_3.4.2-4_arm64.deb && \
    dpkg -i libffi8_3.4.2-4_arm64.deb && \
    rm libffi8_3.4.2-4_arm64.deb

# Upgrade pip
RUN python3 -m pip install --upgrade pip

# Install python dependencies
RUN pip3 install --no-cache-dir \
    pandas \
    Cython \
    Pillow

# Clone and install keras-retinanet from source to build the C/C++ backend extensions for ARM64
WORKDIR /workspace
RUN git clone https://github.com/fizyr/keras-retinanet.git && \
    cd keras-retinanet && \
    sed -i -e "s/'opencv-python[^']*'[ ,]*//g" setup.py && \
    pip3 install . && \
    python3 setup.py build_ext --inplace

# Copy our headless pure python inference script
COPY inference.py /workspace/inference.py

# Set the default command (allows overriding with 'python3 draw_boxes.py')
CMD ["python3", "/workspace/inference.py"]
