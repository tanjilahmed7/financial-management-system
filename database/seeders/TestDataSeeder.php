<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        
        if (!$user) {
            $this->command->error('No user found. Please run the main seeder first.');
            return;
        }

        // Clear existing data
        Transaction::where('user_id', $user->id)->delete();
        Category::where('user_id', $user->id)->delete();
        Account::where('user_id', $user->id)->delete();

        // Create accounts
        $accounts = [
            ['name' => 'Chequing', 'type' => 'checking', 'balance' => 0, 'cleared_balance' => 0],
            ['name' => 'Savings', 'type' => 'savings', 'balance' => 0, 'cleared_balance' => 0],
            ['name' => 'VISA Credit', 'type' => 'credit', 'balance' => 0, 'cleared_balance' => 0],
            ['name' => 'AMEX Gold', 'type' => 'credit', 'balance' => 0, 'cleared_balance' => 0],
        ];

        $accountModels = [];
        foreach ($accounts as $accountData) {
            $accountModels[] = $user->accounts()->create($accountData);
        }

        // Create categories
        $categories = [
            ['name' => 'Groceries', 'color' => '#10B981', 'icon' => 'shopping-cart'],
            ['name' => 'Dining Out', 'color' => '#F59E0B', 'icon' => 'utensils'],
            ['name' => 'Transportation', 'color' => '#3B82F6', 'icon' => 'car'],
            ['name' => 'Entertainment', 'color' => '#8B5CF6', 'icon' => 'film'],
            ['name' => 'Shopping', 'color' => '#EC4899', 'icon' => 'shopping-bag'],
            ['name' => 'Bills & Utilities', 'color' => '#EF4444', 'icon' => 'zap'],
            ['name' => 'Healthcare', 'color' => '#06B6D4', 'icon' => 'heart'],
            ['name' => 'Salary', 'color' => '#10B981', 'icon' => 'dollar-sign'],
            ['name' => 'Freelance', 'color' => '#8B5CF6', 'icon' => 'briefcase'],
            ['name' => 'Investment Returns', 'color' => '#059669', 'icon' => 'trending-up'],
        ];

        $categoryModels = [];
        foreach ($categories as $categoryData) {
            $categoryModels[] = $user->categories()->create($categoryData);
        }

        // Create transactions for the last 30 days
        $transactions = [
            // Chequing Account Transactions
            [
                'account' => 'Chequing',
                'category' => 'Salary',
                'description' => 'Monthly Salary',
                'amount' => 3500.00,
                'date' => Carbon::now()->subDays(2),
                'status' => 'cleared',
                'type' => 'income',
                'is_recurring' => true,
                'recurring_frequency' => 'monthly'
            ],
            [
                'account' => 'Chequing',
                'category' => 'Groceries',
                'description' => 'Walmart Groceries',
                'amount' => -125.50,
                'date' => Carbon::now()->subDays(1),
                'status' => 'cleared',
                'type' => 'expense'
            ],
            [
                'account' => 'Chequing',
                'category' => 'Dining Out',
                'description' => 'Restaurant Dinner',
                'amount' => -85.00,
                'date' => Carbon::now()->subDays(1),
                'status' => 'pending',
                'type' => 'expense'
            ],
            [
                'account' => 'Chequing',
                'category' => 'Transportation',
                'description' => 'Gas Station',
                'amount' => -45.75,
                'date' => Carbon::now(),
                'status' => 'pending',
                'type' => 'expense'
            ],
            [
                'account' => 'Chequing',
                'category' => 'Bills & Utilities',
                'description' => 'Electricity Bill',
                'amount' => -120.00,
                'date' => Carbon::now()->subDays(5),
                'status' => 'cleared',
                'type' => 'expense',
                'is_recurring' => true,
                'recurring_frequency' => 'monthly'
            ],

            // Savings Account Transactions
            [
                'account' => 'Savings',
                'category' => 'Salary',
                'description' => 'Savings Transfer',
                'amount' => 500.00,
                'date' => Carbon::now()->subDays(3),
                'status' => 'cleared',
                'type' => 'income'
            ],
            [
                'account' => 'Savings',
                'category' => 'Investment Returns',
                'description' => 'Interest Payment',
                'amount' => 25.50,
                'date' => Carbon::now()->subDays(10),
                'status' => 'cleared',
                'type' => 'income'
            ],
            [
                'account' => 'Savings',
                'category' => 'Shopping',
                'description' => 'Emergency Fund Withdrawal',
                'amount' => -200.00,
                'date' => Carbon::now()->subDays(7),
                'status' => 'cleared',
                'type' => 'expense'
            ],

            // VISA Credit Card Transactions
            [
                'account' => 'VISA Credit',
                'category' => 'Shopping',
                'description' => 'Amazon Purchase',
                'amount' => -89.99,
                'date' => Carbon::now()->subDays(4),
                'status' => 'pending',
                'type' => 'expense'
            ],
            [
                'account' => 'VISA Credit',
                'category' => 'Entertainment',
                'description' => 'Netflix Subscription',
                'amount' => -15.99,
                'date' => Carbon::now()->subDays(15),
                'status' => 'cleared',
                'type' => 'expense',
                'is_recurring' => true,
                'recurring_frequency' => 'monthly'
            ],
            [
                'account' => 'VISA Credit',
                'category' => 'Healthcare',
                'description' => 'Pharmacy Purchase',
                'amount' => -35.25,
                'date' => Carbon::now()->subDays(2),
                'status' => 'cleared',
                'type' => 'expense'
            ],
            [
                'account' => 'VISA Credit',
                'category' => 'Dining Out',
                'description' => 'Coffee Shop',
                'amount' => -12.50,
                'date' => Carbon::now(),
                'status' => 'pending',
                'type' => 'expense'
            ],

            // AMEX Gold Card Transactions
            [
                'account' => 'AMEX Gold',
                'category' => 'Dining Out',
                'description' => 'Fine Dining Restaurant',
                'amount' => -150.00,
                'date' => Carbon::now()->subDays(6),
                'status' => 'cleared',
                'type' => 'expense'
            ],
            [
                'account' => 'AMEX Gold',
                'category' => 'Transportation',
                'description' => 'Uber Ride',
                'amount' => -28.75,
                'date' => Carbon::now()->subDays(3),
                'status' => 'pending',
                'type' => 'expense'
            ],
            [
                'account' => 'AMEX Gold',
                'category' => 'Shopping',
                'description' => 'Department Store',
                'amount' => -75.00,
                'date' => Carbon::now()->subDays(8),
                'status' => 'cleared',
                'type' => 'expense'
            ],
            [
                'account' => 'AMEX Gold',
                'category' => 'Entertainment',
                'description' => 'Movie Tickets',
                'amount' => -32.00,
                'date' => Carbon::now()->subDays(1),
                'status' => 'pending',
                'type' => 'expense'
            ],

            // Additional Income Transactions
            [
                'account' => 'Chequing',
                'category' => 'Freelance',
                'description' => 'Web Development Project',
                'amount' => 800.00,
                'date' => Carbon::now()->subDays(12),
                'status' => 'cleared',
                'type' => 'income'
            ],
            [
                'account' => 'Savings',
                'category' => 'Investment Returns',
                'description' => 'Stock Dividend',
                'amount' => 45.00,
                'date' => Carbon::now()->subDays(20),
                'status' => 'cleared',
                'type' => 'income'
            ],

            // More Recent Transactions
            [
                'account' => 'Chequing',
                'category' => 'Groceries',
                'description' => 'Local Market',
                'amount' => -67.25,
                'date' => Carbon::now()->subDays(1),
                'status' => 'cleared',
                'type' => 'expense'
            ],
            [
                'account' => 'VISA Credit',
                'category' => 'Bills & Utilities',
                'description' => 'Internet Bill',
                'amount' => -79.99,
                'date' => Carbon::now()->subDays(18),
                'status' => 'cleared',
                'type' => 'expense',
                'is_recurring' => true,
                'recurring_frequency' => 'monthly'
            ],
            [
                'account' => 'AMEX Gold',
                'category' => 'Healthcare',
                'description' => 'Doctor Appointment',
                'amount' => -120.00,
                'date' => Carbon::now()->subDays(5),
                'status' => 'pending',
                'type' => 'expense'
            ],
            [
                'account' => 'Savings',
                'category' => 'Salary',
                'description' => 'Bonus Payment',
                'amount' => 1000.00,
                'date' => Carbon::now()->subDays(25),
                'status' => 'cleared',
                'type' => 'income'
            ]
        ];

        // Create transactions
        foreach ($transactions as $transactionData) {
            $account = $accountModels[array_search($transactionData['account'], array_column($accounts, 'name'))];
            $category = $categoryModels[array_search($transactionData['category'], array_column($categories, 'name'))];

            $user->transactions()->create([
                'account_id' => $account->id,
                'category_id' => $category->id,
                'description' => $transactionData['description'],
                'amount' => $transactionData['amount'],
                'date' => $transactionData['date'],
                'status' => $transactionData['status'],
                'type' => $transactionData['type'],
                'is_recurring' => $transactionData['is_recurring'] ?? false,
                'recurring_frequency' => $transactionData['recurring_frequency'] ?? null,
            ]);
        }

        // Recalculate account balances
        foreach ($accountModels as $account) {
            $totalBalance = $account->transactions()->sum('amount');
            $clearedBalance = $account->transactions()->where('status', 'cleared')->sum('amount');
            
            $account->update([
                'balance' => $totalBalance,
                'cleared_balance' => $clearedBalance,
            ]);
        }

        $this->command->info('Test data seeded successfully!');
        $this->command->info('Created:');
        $this->command->info('- ' . count($accountModels) . ' accounts');
        $this->command->info('- ' . count($categoryModels) . ' categories');
        $this->command->info('- ' . count($transactions) . ' transactions');
    }
}
