# Financial Management System

A modern, full-stack financial management application built with Laravel 12, Inertia.js, and React. This application provides comprehensive personal finance tracking with real-time updates, beautiful analytics, and an intuitive user interface.

## 🚀 Features

### 💰 Account Management

-   **Multiple Account Types**: Checking, Savings, and Credit accounts
-   **Real-time Balance Tracking**: Automatic balance calculations from transactions
-   **Pending vs Cleared Balances**: Separate tracking for pending and cleared transactions
-   **Account Cards**: Visual representation with color-coded balances

### 📊 Transaction Management

-   **CRUD Operations**: Add, edit, delete, and update transaction status
-   **Multiple Transaction Types**: Income, Expense, and Transfer
-   **Category Management**: Custom categories with color coding
-   **Recurring Transactions**: Support for weekly, monthly, and yearly recurring transactions
-   **Status Tracking**: Pending and Cleared status management
-   **Real-time Updates**: Instant balance updates without page reload

### 📈 Analytics Dashboard

-   **Financial Overview**: Total balance across all accounts
-   **Income vs Expenses**: Visual breakdown of financial flow
-   **Category Analysis**: Spending patterns by category
-   **Account Distribution**: Balance distribution across accounts
-   **Interactive Charts**: Beautiful data visualization with Recharts

### 🔐 Authentication & Security

-   **User Authentication**: Secure login system
-   **Password Management**: Change password functionality
-   **Session Management**: Protected routes and middleware
-   **CSRF Protection**: Built-in security measures

### 🎨 Modern UI/UX

-   **Responsive Design**: Works on desktop, tablet, and mobile
-   **Dark/Light Mode**: Theme support with CSS variables
-   **Real-time Interactions**: Smooth animations and transitions
-   **Accessibility**: ARIA labels and keyboard navigation
-   **Professional Design**: Clean, modern interface using Tailwind CSS

## 🛠 Tech Stack

### Backend

-   **Laravel 11**: Modern PHP framework with robust features
-   **MySQL 8.0**: Reliable database for data persistence
-   **Eloquent ORM**: Powerful database relationships and queries
-   **API Resources**: RESTful API endpoints for frontend communication
-   **Validation**: Comprehensive form validation and error handling

### Frontend

-   **React 18**: Modern JavaScript library for UI components
-   **Inertia.js**: Seamless SPA experience without API complexity
-   **Tailwind CSS**: Utility-first CSS framework for styling
-   **Radix UI**: Accessible, unstyled UI components
-   **Lucide Icons**: Beautiful, customizable icons
-   **Recharts**: Data visualization library for analytics

### Development Tools

-   **Vite**: Fast build tool and development server
-   **Docker**: Containerized development environment
-   **Laravel Mix**: Asset compilation and optimization
-   **ESLint & Prettier**: Code quality and formatting

## 📋 Prerequisites

-   **PHP 8.2+**: Required for Laravel 11
-   **Node.js 18+**: Required for frontend build tools
-   **MySQL 8.0+**: Database server
-   **Composer**: PHP dependency manager
-   **npm/yarn**: Node.js package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd financial-management
```

### 2. Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

### 3. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Database Configuration

```bash
# Configure your database in .env file
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=financial_management
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 5. Database Setup

```bash
# Run migrations
php artisan migrate

# Seed the database with test data
php artisan db:seed --class=TestDataSeeder
```

### 6. Build Assets

```bash
# Build for production
npm run build

# Or for development with hot reload
npm run dev
```

### 7. Start the Application

```bash
# Start Laravel development server
php artisan serve
```

### 8. Access the Application

-   **Application**: http://localhost:8000
-   **Default Login**:
    -   Email: `tanjilahmed87@gmail.com`
    -   Password: `12345`

## 🐳 Docker Setup (Alternative)

### Using Docker Compose

```bash
# Copy Docker environment file
cp .env.docker .env

# Start containers
docker-compose up -d

# Run migrations and seeders
docker-compose exec app php artisan migrate
docker-compose exec app php artisan db:seed --class=TestDataSeeder

# Build frontend assets
docker-compose exec app npm run build
```

### Docker Commands

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Access container
docker-compose exec app bash
```

## 📁 Project Structure

```
financial-management/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/           # API controllers for transactions, accounts, categories
│   │   │   ├── Auth/          # Authentication controllers
│   │   │   └── DashboardController.php
│   │   └── Middleware/
│   ├── Models/                # Eloquent models with relationships
│   └── Console/Commands/      # Custom Artisan commands
├── database/
│   ├── migrations/            # Database schema
│   └── seeders/              # Test data seeders
├── resources/
│   ├── js/
│   │   ├── Components/        # Reusable React components
│   │   │   ├── ui/           # Radix UI components
│   │   │   ├── AccountCard.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Header.jsx
│   │   │   └── TransactionsList.jsx
│   │   ├── Pages/            # Page components
│   │   │   ├── Auth/         # Authentication pages
│   │   │   └── Dashboard.jsx
│   │   └── lib/              # Utility libraries
│   └── views/                # Blade templates
├── routes/
│   ├── web.php              # Web routes
│   ├── api.php              # API routes
│   └── auth.php             # Authentication routes
└── public/                  # Compiled assets
```

## 🔧 Key Features Implementation

### Real-time Balance Updates

-   Automatic balance recalculation when transactions are added/edited/deleted
-   API endpoints for fresh balance calculations
-   Frontend state management with React hooks
-   No page reload required for updates

### Transaction Management

-   Full CRUD operations with validation
-   Status management (pending/cleared)
-   Category and account associations
-   Recurring transaction support
-   Real-time account balance updates

### Analytics Dashboard

-   Interactive charts using Recharts
-   Financial overview with key metrics
-   Category-based spending analysis
-   Account balance distribution
-   Responsive design for all screen sizes

### User Authentication

-   Secure login system
-   Password change functionality
-   Protected routes with middleware
-   Session-based authentication
-   CSRF protection

## 🎯 API Endpoints

### Transactions

-   `GET /api/transactions` - List user transactions
-   `POST /api/transactions` - Create new transaction
-   `PUT /api/transactions/{id}` - Update transaction
-   `DELETE /api/transactions/{id}` - Delete transaction
-   `PATCH /api/transactions/{id}/status` - Update transaction status

### Accounts

-   `GET /api/accounts` - List user accounts with calculated balances
-   `POST /api/accounts` - Create new account
-   `PUT /api/accounts/{id}` - Update account
-   `DELETE /api/accounts/{id}` - Delete account

### Categories

-   `GET /api/categories` - List user categories
-   `POST /api/categories` - Create new category
-   `PUT /api/categories/{id}` - Update category
-   `DELETE /api/categories/{id}` - Delete category

## 🧪 Testing

### Test Data

The application includes comprehensive test data:

-   4 accounts (Chequing, Savings, VISA Credit, AMEX Gold)
-   10 categories (Income and Expense categories)
-   22 sample transactions with realistic data
-   Mixed transaction statuses and types

### Running Tests

```bash
# Run PHP tests
php artisan test

# Run frontend tests (if configured)
npm test
```

## 🔒 Security Features

-   **Authentication**: User login with session management
-   **Authorization**: Route protection with middleware
-   **Validation**: Comprehensive form validation
-   **CSRF Protection**: Built-in Laravel CSRF protection
-   **Password Security**: Laravel's password validation rules
-   **SQL Injection Protection**: Eloquent ORM protection

## 🚀 Deployment

### Production Build

```bash
# Install production dependencies
composer install --optimize-autoloader --no-dev

# Build frontend assets
npm run build

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Environment Variables

```env
APP_NAME="Financial Management"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_PORT=3306
DB_DATABASE=financial_management
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## 🆘 Support

For support and questions:

-   Create an issue in the repository
-   Check the documentation
-   Review the code comments

---

**Built with ❤️ using Laravel, React, and Inertia.js**
