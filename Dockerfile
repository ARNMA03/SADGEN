# Use Python 3.10 slim as base image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV DATABASE_URL=postgresql://postgres:postgres@db:5432/sadgen_db

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend /app/backend
# Copy frontend code (so it can be served by FastAPI)
COPY frontend /app/frontend

# Expose port 8000
EXPOSE 8000

# Set the working directory to backend to run uvicorn
WORKDIR /app/backend

# Command to run the application
# We use a shell command to allow seeding before starting
CMD python seed.py && uvicorn main:app --host 0.0.0.0 --port 8000
