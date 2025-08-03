<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create default user
        $user = User::create([
            'name' => 'Tanjil Ahmed',
            'email' => 'tanjilahmed87@gmail.com',
            'password' => Hash::make('12345'),
            'email_verified_at' => now(),
        ]);

        // Create default categories
        $categories = [
            ['name' => 'Dining', 'color' => '#ef4444'],
            ['name' => 'Entertainment', 'color' => '#8b5cf6'],
            ['name' => 'Groceries', 'color' => '#10b981'],
            ['name' => 'Healthcare', 'color' => '#06b6d4'],
            ['name' => 'Income', 'color' => '#84cc16'],
            ['name' => 'Other', 'color' => '#6b7280'],
            ['name' => 'Shopping', 'color' => '#f59e0b'],
            ['name' => 'Transfer', 'color' => '#6366f1'],
            ['name' => 'Transportation', 'color' => '#f97316'],
            ['name' => 'Utilities', 'color' => '#ec4899'],
        ];

        foreach ($categories as $categoryData) {
            Category::create([
                'user_id' => $user->id,
                'name' => $categoryData['name'],
                'color' => $categoryData['color'],
                'is_default' => true,
            ]);
        }

        // Create default accounts
        $accounts = [
            [
                'name' => 'Chequing',
                'type' => 'checking',
                'balance' => 2845.25,
                'cleared_balance' => 3045.25,
            ],
            [
                'name' => 'Savings',
                'type' => 'savings',
                'balance' => 12500.00,
                'cleared_balance' => 12500.00,
            ],
            [
                'name' => 'VISA Credit',
                'type' => 'credit',
                'balance' => -159.38,
                'cleared_balance' => -94.18,
            ],
            [
                'name' => 'AMEX Gold',
                'type' => 'credit',
                'balance' => -4.75,
                'cleared_balance' => -4.75,
            ],
        ];

        foreach ($accounts as $accountData) {
            Account::create([
                'user_id' => $user->id,
                'name' => $accountData['name'],
                'type' => $accountData['type'],
                'balance' => $accountData['balance'],
                'cleared_balance' => $accountData['cleared_balance'],
            ]);
        }

        // Get category and account IDs for transactions
        $groceriesCategory = Category::where('name', 'Groceries')->first();
        $incomeCategory = Category::where('name', 'Income')->first();
        $transportationCategory = Category::where('name', 'Transportation')->first();
        $diningCategory = Category::where('name', 'Dining')->first();
        $transferCategory = Category::where('name', 'Transfer')->first();

        $chequingAccount = Account::where('name', 'Chequing')->first();
        $visaAccount = Account::where('name', 'VISA Credit')->first();
        $amexAccount = Account::where('name', 'AMEX Gold')->first();

        // Create sample transactions
        $transactions = [
            [
                'description' => 'Grocery Store',
                'amount' => -89.43,
                'category_id' => $groceriesCategory->id,
                'account_id' => $visaAccount->id,
                'date' => '2025-01-30',
                'status' => 'cleared',
                'type' => 'expense',
            ],
            [
                'description' => 'Salary Deposit',
                'amount' => 3200.00,
                'category_id' => $incomeCategory->id,
                'account_id' => $chequingAccount->id,
                'date' => '2025-01-29',
                'status' => 'cleared',
                'type' => 'income',
            ],
            [
                'description' => 'Gas Station',
                'amount' => -65.20,
                'category_id' => $transportationCategory->id,
                'account_id' => $visaAccount->id,
                'date' => '2025-01-28',
                'status' => 'pending',
                'type' => 'expense',
            ],
            [
                'description' => 'Coffee Shop',
                'amount' => -4.75,
                'category_id' => $diningCategory->id,
                'account_id' => $amexAccount->id,
                'date' => '2025-01-27',
                'status' => 'cleared',
                'type' => 'expense',
            ],
            [
                'description' => 'Online Transfer',
                'amount' => -200.00,
                'category_id' => $transferCategory->id,
                'account_id' => $chequingAccount->id,
                'date' => '2025-01-26',
                'status' => 'pending',
                'type' => 'transfer',
            ],
        ];

        foreach ($transactions as $transactionData) {
            Transaction::create([
                'user_id' => $user->id,
                'description' => $transactionData['description'],
                'amount' => $transactionData['amount'],
                'category_id' => $transactionData['category_id'],
                'account_id' => $transactionData['account_id'],
                'date' => $transactionData['date'],
                'status' => $transactionData['status'],
                'type' => $transactionData['type'],
            ]);
        }
    }
}
