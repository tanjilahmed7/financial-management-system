<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\CategoryController;

Route::middleware(['web', 'auth'])->group(function () {
    // Transactions
    Route::apiResource('transactions', TransactionController::class);
    Route::patch('transactions/{transaction}/status', [TransactionController::class, 'updateStatus']);
    
    // Accounts
    Route::apiResource('accounts', AccountController::class);
    
    // Categories
    Route::apiResource('categories', CategoryController::class);
}); 