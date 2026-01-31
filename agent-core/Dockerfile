FROM python:3.12-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    poppler-utils \
    cmake \
    git \
    ninja-build \
    curl \
    pkg-config \
    libopenjp2-7-dev \
    libjpeg-dev \
    libtiff-dev \
    libpng-dev \
    libfontconfig1-dev \
    libfreetype6-dev \
    libglib2.0-dev \
    libcurl4-openssl-dev \
    liblcms2-dev \
    libnss3-dev \
    python3-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /tmp

# Clone and build Poppler
RUN git clone https://gitlab.freedesktop.org/poppler/poppler.git && \
    cd poppler && \
    git checkout poppler-25.03.0 && \
    mkdir build && cd build && \
    cmake .. \
      -G Ninja \
      -DENABLE_XPDF_HEADERS=ON \
      -DENABLE_CURL=ON \
      -DENABLE_GPGME=OFF \
      -DENABLE_QT5=OFF \
      -DENABLE_QT6=OFF \
      -DENABLE_BOOST=OFF \
      -DCMAKE_BUILD_TYPE=Release \
      -DCMAKE_INSTALL_PREFIX=/usr/local && \
    ninja && \
    ninja install

# Cleanup
RUN rm -rf /tmp/poppler

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /application

# Install Poetry version 2.0.1
RUN curl -sSL https://install.python-poetry.org | POETRY_VERSION=2.0.1 python3 -

# Add Poetry to PATH
ENV PATH="/root/.local/bin:$PATH"

# Copy dependency files first
COPY pyproject.toml poetry.toml poetry.lock README.md ./

COPY app/main.py ./app/main.py

# Install dependencies
RUN poetry install

# Install playwright
RUN poetry run playwright install-deps
RUN poetry run playwright install

# Copy the rest of the application
COPY . .

RUN poetry add hf_xet
RUN poetry run run:quantize-reranker

# Expose the application port
# EXPOSE 8082

# Start the application
# CMD ["poetry", "run", "start:prod"]
