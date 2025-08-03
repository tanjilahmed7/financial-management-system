<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Get user's accounts with pending transactions count
        $accounts = $user->accounts()
            ->with('transactions')
            ->get()
            ->map(function ($account) {
                return [
                    'id' => $account->id,
                    'name' => $account->name,
                    'type' => $account->type,
                    'balance' => (float) $account->balance,
                    'clearedBalance' => (float) $account->cleared_balance, // Match old structure
                    'pendingTransactions' => $account->pending_transactions_count, // Match old structure
                ];
            });

        // Get user's categories
        $categories = $user->categories()
            ->orderBy('name')
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                ];
            });

        // Get recent transactions
        $transactions = $user->transactions()
            ->with(['account', 'category'])
            ->latest('date')
            ->limit(10)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'date' => $transaction->date->format('Y-m-d'),
                    'description' => $transaction->description,
                    'amount' => (float) $transaction->amount,
                    'category' => $transaction->category->name,
                    'account' => $transaction->account->name,
                    'status' => $transaction->status,
                    'type' => $transaction->type,
                    'recurring' => $transaction->is_recurring, // Match old structure
                    'recurringFrequency' => $transaction->recurring_frequency, // Match old structure
                ];
            });

        // Motivational messages
        $motivationalMessages = [
            "Let's take control of your money—your budget, your rules.",
            "Here's where your finances start making sense.",
            "Ready to see where your money's really going?",
            "You're one step closer to smarter spending.",
            "Let's keep your budget on track, one entry at a time."
        ];

        return Inertia::render('Dashboard', [
            'accounts' => $accounts,
            'categories' => $categories,
            'transactions' => $transactions,
            'currentMessage' => $motivationalMessages[array_rand($motivationalMessages)],
            'user' => $user
        ]);
    }
} 