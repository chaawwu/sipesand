<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\NfcAttendanceController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\WebhookController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// 1. NFC Absensi Santri (KTSD)
Route::post('/nfc/scan', [NfcAttendanceController::class, 'scan']);
Route::get('/nfc/history', [NfcAttendanceController::class, 'history']);

// 2. KaseraPay Payment Gateway Routes
Route::post('/payments/create', [PaymentController::class, 'create']);
Route::post('/payments/webhook', [WebhookController::class, 'handle']);
Route::get('/payments/status/{external_id}', [PaymentController::class, 'status']);
Route::get('/payments/history', [PaymentController::class, 'history']);

