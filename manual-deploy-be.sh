#!/bin/bash

# Load env variables
if [ -f .env.deploy.be ]; then
  echo "📦 Loading backend environment variables..."
  set -a
  source .env.deploy.be
  set +a
else
  echo "⚠️  .env.deploy.be not found"
  exit 1
fi

echo "🔍 Checking required environment variables..."
echo "POSTGRES_DSN: $POSTGRES_DSN"
echo "GROQ_API_KEY: $GROQ_API_KEY"

# Config
PROJECT_ID="garudahacks-467004"
REGION="asia-southeast1"
SERVICE_NAME="nabung-backend"
IMAGE="gcr.io/$PROJECT_ID/$SERVICE_NAME"
DIR="./backend"

# Build
echo "🔧 Building backend Docker image..."
docker build -t $IMAGE $DIR || exit 1

# Push
echo "⬆️  Pushing image to GCR..."
docker push $IMAGE || exit 1

# Deploy
echo "🚀 Deploying backend to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --concurrency=80 \
  --timeout=300s \
  --set-env-vars POSTGRES_DSN=$POSTGRES_DSN,GROQ_API_KEY=$GROQ_API_KEY

echo "✅ Backend deployed to Cloud Run!"
