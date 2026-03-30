FROM python:3.12-slim

WORKDIR /app

# Install system dependencies (minimal)
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install CPU-only torch from the official PyTorch CPU wheel index.
RUN pip install --no-cache-dir \
    torch==2.3.1+cpu \
    --index-url https://download.pytorch.org/whl/cpu

# Install remaining Python dependencies from requirements.
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set default command to run your app
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}