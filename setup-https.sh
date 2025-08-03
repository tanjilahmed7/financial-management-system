#!/bin/bash

# Setup HTTPS for Financial Management System
echo "Setting up HTTPS for Financial Management System..."

# Create SSL directory
mkdir -p docker/nginx/ssl

# Generate self-signed certificate
echo "Generating self-signed SSL certificate..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/nginx/ssl/key.pem \
  -out docker/nginx/ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=web.financial-management.orb.local"

# Copy SSL nginx configuration
echo "Setting up SSL nginx configuration..."
cp docker/nginx/default-ssl.conf docker/nginx/default.conf

# Update .env file if it exists
if [ -f .env ]; then
    echo "Updating .env file for HTTPS..."
    # Add or update APP_URL
    if grep -q "APP_URL=" .env; then
        sed -i '' 's|APP_URL=.*|APP_URL=https://web.financial-management.orb.local|' .env
    else
        echo "APP_URL=https://web.financial-management.orb.local" >> .env
    fi
    
    # Add or update FORCE_HTTPS
    if grep -q "FORCE_HTTPS=" .env; then
        sed -i '' 's|FORCE_HTTPS=.*|FORCE_HTTPS=true|' .env
    else
        echo "FORCE_HTTPS=true" >> .env
    fi
else
    echo "Warning: .env file not found. Please create it manually with:"
    echo "APP_URL=https://web.financial-management.orb.local"
    echo "FORCE_HTTPS=true"
fi

echo "HTTPS setup complete!"
echo ""
echo "Next steps:"
echo "1. Restart your Docker containers:"
echo "   docker-compose down && docker-compose up -d"
echo ""
echo "2. Access your application via HTTPS:"
echo "   https://web.financial-management.orb.local"
echo ""
echo "Note: You may need to accept the self-signed certificate in your browser." 