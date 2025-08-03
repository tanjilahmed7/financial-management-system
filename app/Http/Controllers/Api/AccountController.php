<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class AccountController extends Controller
{
    public function index()
    {
        $accounts = Auth::user()
            ->accounts()
            ->with('transactions')
            ->get()
            ->map(function ($account) {
                // Calculate fresh balances from transactions
                $totalBalance = $account->transactions()->sum('amount');
                $clearedBalance = $account->transactions()
                    ->where('status', 'cleared')
                    ->sum('amount');
                
                return [
                    'id' => $account->id,
                    'name' => $account->name,
                    'type' => $account->type,
                    'balance' => (float) $totalBalance,
                    'clearedBalance' => (float) $clearedBalance,
                    'pendingTransactions' => $account->transactions()->where('status', 'pending')->count(),
                ];
            });

        return response()->json(['data' => $accounts]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => ['required', Rule::in(['checking', 'savings', 'credit'])],
            'balance' => 'required|numeric',
            'currency' => 'string|max:3|default:USD',
        ]);

        $account = Auth::user()->accounts()->create($validated);

        return response()->json([
            'message' => 'Account created successfully',
            'data' => [
                'id' => $account->id,
                'name' => $account->name,
                'type' => $account->type,
                'balance' => (float) $account->balance,
                'clearedBalance' => (float) $account->cleared_balance,
                'pendingTransactions' => 0,
            ]
        ], 201);
    }

    public function show(Account $account)
    {
        if ($account->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Calculate fresh balances from transactions
        $totalBalance = $account->transactions()->sum('amount');
        $clearedBalance = $account->transactions()
            ->where('status', 'cleared')
            ->sum('amount');

        return response()->json([
            'data' => [
                'id' => $account->id,
                'name' => $account->name,
                'type' => $account->type,
                'balance' => (float) $totalBalance,
                'clearedBalance' => (float) $clearedBalance,
                'pendingTransactions' => $account->transactions()->where('status', 'pending')->count(),
            ]
        ]);
    }

    public function update(Request $request, Account $account)
    {
        if ($account->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => ['sometimes', 'required', Rule::in(['checking', 'savings', 'credit'])],
            'balance' => 'sometimes|required|numeric',
            'currency' => 'sometimes|string|max:3',
            'is_active' => 'sometimes|boolean',
        ]);

        $account->update($validated);

        return response()->json([
            'message' => 'Account updated successfully',
            'data' => [
                'id' => $account->id,
                'name' => $account->name,
                'type' => $account->type,
                'balance' => (float) $account->balance,
                'clearedBalance' => (float) $account->cleared_balance,
                'pendingTransactions' => $account->pending_transactions_count,
            ]
        ]);
    }

    public function destroy(Account $account)
    {
        if ($account->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if account has transactions
        if ($account->transactions()->exists()) {
            return response()->json(['message' => 'Cannot delete account with transactions'], 400);
        }

        $account->delete();

        return response()->json(['message' => 'Account deleted successfully']);
    }
}
