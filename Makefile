.PHONY: help up down build restart logs bash migrate fresh seed test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Start the Docker containers
	docker-compose up -d

down: ## Stop the Docker containers
	docker-compose down

build: ## Build the Docker containers
	docker-compose build --no-cache

restart: ## Restart the Docker containers
	docker-compose restart

logs: ## Show logs from all containers
	docker-compose logs -f

logs-app: ## Show logs from app container
	docker-compose logs -f app

logs-web: ## Show logs from web container
	docker-compose logs -f web

logs-db: ## Show logs from database container
	docker-compose logs -f db

bash: ## Access bash shell in app container
	docker-compose exec app bash

bash-web: ## Access bash shell in web container
	docker-compose exec web sh

bash-db: ## Access bash shell in database container
	docker-compose exec db bash

migrate: ## Run database migrations
	docker-compose exec app php artisan migrate

fresh: ## Fresh migrate and seed database
	docker-compose exec app php artisan migrate:fresh --seed

seed: ## Run database seeders
	docker-compose exec app php artisan db:seed

test: ## Run tests
	docker-compose exec app php artisan test

install: ## Install PHP and Node dependencies
	docker-compose exec app composer install
	docker-compose exec app npm install

build-assets: ## Build frontend assets
	docker-compose exec app npm run build

dev-assets: ## Start Vite development server
	docker-compose exec app npm run dev

cache-clear: ## Clear Laravel cache
	docker-compose exec app php artisan cache:clear
	docker-compose exec app php artisan config:clear
	docker-compose exec app php artisan route:clear
	docker-compose exec app php artisan view:clear

setup: ## Initial setup (build, up, migrate, seed)
	make build
	make up
	sleep 10
	make migrate
	make seed 