#!/bin/bash

# Setup HTTP for Financial Management System (revert from HTTPS)
echo "Setting up HTTP for Financial Management System..."

# Restore original nginx configuration
echo "Restoring HTTP nginx configuration..."
cat > docker/nginx/default.conf << 'EOF'
server {
    listen 80;
    index index.php index.html;
    error_log  /var/log/nginx/error.log;
    access_log /var/log/nginx/access.log;
    root /var/www/public;

    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass app:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
    }

    location / {
        try_files $uri $uri/ /index.php?$query_string;
        gzip_static on;
    }

    location ~ /\.ht {
        deny all;
    }
}
EOF

# Update .env file if it exists
if [ -f .env ]; then
    echo "Updating .env file for HTTP..."
    # Add or update APP_URL
    if grep -q "APP_URL=" .env; then
        sed -i '' 's|APP_URL=.*|APP_URL=http://web.financial-management.orb.local|' .env
    else
        echo "APP_URL=http://web.financial-management.orb.local" >> .env
    fi
    
    # Add or update FORCE_HTTPS
    if grep -q "FORCE_HTTPS=" .env; then
        sed -i '' 's|FORCE_HTTPS=.*|FORCE_HTTPS=false|' .env
    else
        echo "FORCE_HTTPS=false" >> .env
    fi
else
    echo "Warning: .env file not found. Please create it manually with:"
    echo "APP_URL=http://web.financial-management.orb.local"
    echo "FORCE_HTTPS=false"
fi

echo "HTTP setup complete!"
echo ""
echo "Next steps:"
echo "1. Restart your Docker containers:"
echo "   docker-compose down && docker-compose up -d"
echo ""
echo "2. Access your application via HTTP:"
echo "   http://web.financial-management.orb.local" 