<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/login',  [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
});

Route::middleware('auth')->group(function () {
    // DELETE matches Wayfinder's destroy() action - Link method="delete" in AppLayout
    Route::delete('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});
