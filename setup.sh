#!/bin/bash

# Financial Management System Setup Script

set -e

echo "🚀 Setting up Financial Management System..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Makefile exists
if [ ! -f "Makefile" ]; then
    echo "❌ Makefile not found. Please ensure you're in the project root directory."
    exit 1
fi

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.docker" ]; then
        echo "📋 Copying Docker environment file..."
        cp .env.docker .env
    else
        echo "❌ .env.docker file not found. Please create it first."
        exit 1
    fi
fi

# Build and start containers
echo "🔨 Building Docker containers..."
make build

echo "🚀 Starting containers..."
make up

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 15

# Run migrations
echo "🗄️  Running database migrations..."
make migrate

# Run seeders
echo "🌱 Running database seeders..."
make seed

echo "✅ Setup complete!"
echo ""
echo "🌐 Access your application at: http://localhost:8000"
echo "🗄️  Database is available at: localhost:3307"
echo ""
echo "📚 Useful commands:"
echo "  make up          - Start containers"
echo "  make down        - Stop containers"
echo "  make bash        - Access app container"
echo "  make logs        - View logs"
echo "  make help        - Show all available commands"
echo ""
echo "🎉 Happy coding!" 