<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Auth::user()
            ->transactions()
            ->with(['account', 'category'])
            ->latest('date')
            ->get();

        return response()->json([
            'data' => $transactions->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'date' => $transaction->date->format('Y-m-d'),
                    'description' => $transaction->description,
                    'amount' => (float) $transaction->amount,
                    'category' => $transaction->category->name,
                    'account' => $transaction->account->name,
                    'status' => $transaction->status,
                    'type' => $transaction->type,
                    'is_recurring' => $transaction->is_recurring,
                    'recurring_frequency' => $transaction->recurring_frequency,
                ];
            })
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'category_id' => 'required|exists:categories,id',
            'account_id' => 'required|exists:accounts,id',
            'date' => 'required|date',
            'status' => ['required', Rule::in(['pending', 'cleared'])],
            'type' => ['required', Rule::in(['expense', 'income', 'transfer'])],
            'is_recurring' => 'boolean',
            'recurring_frequency' => ['nullable', Rule::in(['weekly', 'monthly', 'yearly'])],
        ]);

        $user = Auth::user();
        
        // Ensure the category and account belong to the user
        if (!$user->categories()->where('id', $validated['category_id'])->exists()) {
            return response()->json(['message' => 'Category not found'], 404);
        }
        
        if (!$user->accounts()->where('id', $validated['account_id'])->exists()) {
            return response()->json(['message' => 'Account not found'], 404);
        }

        $transaction = $user->transactions()->create($validated);

        // Recalculate account balances
        $this->recalculateAccountBalances($validated['account_id']);

        return response()->json([
            'message' => 'Transaction created successfully',
            'data' => [
                'id' => $transaction->id,
                'date' => $transaction->date->format('Y-m-d'),
                'description' => $transaction->description,
                'amount' => (float) $transaction->amount,
                'category' => $transaction->category->name,
                'account' => $transaction->account->name,
                'status' => $transaction->status,
                'type' => $transaction->type,
                'is_recurring' => $transaction->is_recurring,
                'recurring_frequency' => $transaction->recurring_frequency,
            ]
        ], 201);
    }

    /**
     * Recalculate account balances based on transactions
     */
    private function recalculateAccountBalances($accountId)
    {
        $account = Account::find($accountId);
        if (!$account) {
            return;
        }

        // Calculate total balance from all transactions
        $totalBalance = $account->transactions()->sum('amount');
        
        // Calculate cleared balance from cleared transactions
        $clearedBalance = $account->transactions()
            ->where('status', 'cleared')
            ->sum('amount');

        // Update the account
        $account->update([
            'balance' => $totalBalance,
            'cleared_balance' => $clearedBalance,
        ]);
    }

    public function show(Transaction $transaction)
    {
        if ($transaction->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'data' => [
                'id' => $transaction->id,
                'date' => $transaction->date->format('Y-m-d'),
                'description' => $transaction->description,
                'amount' => (float) $transaction->amount,
                'category_id' => $transaction->category_id,
                'account_id' => $transaction->account_id,
                'status' => $transaction->status,
                'type' => $transaction->type,
                'is_recurring' => $transaction->is_recurring,
                'recurring_frequency' => $transaction->recurring_frequency,
            ]
        ]);
    }

    public function update(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'description' => 'sometimes|required|string|max:255',
            'amount' => 'sometimes|required|numeric',
            'category_id' => 'sometimes|required|exists:categories,id',
            'account_id' => 'sometimes|required|exists:accounts,id',
            'date' => 'sometimes|required|date',
            'status' => ['sometimes', 'required', Rule::in(['pending', 'cleared'])],
            'type' => ['sometimes', 'required', Rule::in(['expense', 'income', 'transfer'])],
            'is_recurring' => 'sometimes|boolean',
            'recurring_frequency' => ['sometimes', 'nullable', Rule::in(['weekly', 'monthly', 'yearly'])],
        ]);

        $oldAccountId = $transaction->account_id;
        $transaction->update($validated);

        // Recalculate balances for both old and new accounts (if account changed)
        $this->recalculateAccountBalances($oldAccountId);
        if (isset($validated['account_id']) && $validated['account_id'] !== $oldAccountId) {
            $this->recalculateAccountBalances($validated['account_id']);
        }

        return response()->json([
            'message' => 'Transaction updated successfully',
            'data' => [
                'id' => $transaction->id,
                'date' => $transaction->date->format('Y-m-d'),
                'description' => $transaction->description,
                'amount' => (float) $transaction->amount,
                'category' => $transaction->category->name,
                'account' => $transaction->account->name,
                'status' => $transaction->status,
                'type' => $transaction->type,
                'is_recurring' => $transaction->is_recurring,
                'recurring_frequency' => $transaction->recurring_frequency,
            ]
        ]);
    }

    public function destroy(Transaction $transaction)
    {
        if ($transaction->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $accountId = $transaction->account_id;
        $transaction->delete();

        // Recalculate account balance after deletion
        $this->recalculateAccountBalances($accountId);

        return response()->json(['message' => 'Transaction deleted successfully']);
    }

    public function updateStatus(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in(['pending', 'cleared'])],
        ]);

        $oldStatus = $transaction->status;
        $transaction->update($validated);

        // Recalculate account balance if status changed
        if ($oldStatus !== $validated['status']) {
            $this->recalculateAccountBalances($transaction->account_id);
        }

        return response()->json([
            'message' => 'Transaction status updated successfully',
            'data' => [
                'id' => $transaction->id,
                'status' => $transaction->status,
            ]
        ]);
    }
}
