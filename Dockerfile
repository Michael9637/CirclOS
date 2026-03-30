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
    torch==2.4.1+cpu \
    --index-url https://download.pytorch.org/whl/cpu

# Install remaining Python dependencies from requirements.
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set default command to run your app
CMD ["python", "-c", "import os,uvicorn; uvicorn.run('main:app', host='0.0.0.0', port=int(os.getenv('PORT', '8000')))" ]