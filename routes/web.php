<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth'])
    ->name('dashboard');

// Test route to verify data structure
Route::get('/test-data', function () {
    if (!Auth::check()) {
        return response()->json(['error' => 'Not authenticated']);
    }
    
    $user = Auth::user();
    $accounts = $user->accounts()->with('transactions')->get();
    $categories = $user->categories()->pluck('name')->toArray();
    $transactions = $user->transactions()->with(['account', 'category'])->get();
    
    return response()->json([
        'accounts_count' => $accounts->count(),
        'categories_count' => count($categories),
        'transactions_count' => $transactions->count(),
        'sample_account' => $accounts->first(),
        'sample_transaction' => $transactions->first(),
    ]);
})->middleware(['auth']);

require __DIR__.'/auth.php';
