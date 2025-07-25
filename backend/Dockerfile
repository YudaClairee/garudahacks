# Stage 1: Build the Go app
FROM golang:1.24-alpine AS builder

# Set working directory
WORKDIR /app

# Set Go environment
ENV GIN_MODE=release

# Copy go mod files and download deps
COPY go.mod go.sum ./
RUN go mod download

# Copy rest of the source
COPY . .

# Build the binary
RUN go build -o main .

# Stage 2: Run minimal image
FROM alpine:latest

# Set working directory
WORKDIR /root/

# Copy binary from builder stage
COPY --from=builder /app/main .
COPY --from=builder /app/.env .env

# Expose backend port
EXPOSE 8080

# Run the binary
CMD ["./main"]