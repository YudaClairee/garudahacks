#!/bin/bash

# Config
PROJECT_ID="garudahacks-467004"
REGION="asia-southeast1"
SERVICE_NAME="nabung-frontend"
IMAGE="gcr.io/$PROJECT_ID/$SERVICE_NAME"
DIR="."

# Build
echo "🔧 Building frontend Docker image..."
docker build -t $IMAGE $DIR || exit 1

# Push
echo "⬆️  Pushing image to GCR..."
docker push $IMAGE || exit 1

# Deploy
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --concurrency=60 \
  --timeout=300s

echo "✅ Frontend deployed to Cloud Run!"
