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

// 3. Ananda by SiPesand - Aplikasi Wali Santri API (Multi-tenant & Multi-pesantren)
Route::prefix('v1/wali')->group(function () {
    // Public routes
    Route::get('/pesantrens', [\App\Http\Controllers\Api\Wali\WaliAuthController::class, 'pesantrens']);
    Route::post('/auth/request-otp', [\App\Http\Controllers\Api\Wali\WaliAuthController::class, 'requestOtp']);
    Route::post('/auth/verify-otp', [\App\Http\Controllers\Api\Wali\WaliAuthController::class, 'verifyOtp']);
    Route::post('/auth/register', [\App\Http\Controllers\Api\Wali\WaliAuthController::class, 'register']);
    Route::get('/kwitansi/{receiptNo}/html', [\App\Http\Controllers\Api\Wali\WaliKeuanganController::class, 'kwitansiHtml']);
    Route::get('/kwitansi/{receiptNo}', [\App\Http\Controllers\Api\Wali\WaliKeuanganController::class, 'kwitansiDetail']);

    // Protected Wali Santri routes (Sanctum)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [\App\Http\Controllers\Api\Wali\WaliAuthController::class, 'me']);
        Route::get('/dashboard', [\App\Http\Controllers\Api\Wali\WaliDashboardController::class, 'index']);

        // Keuangan & Pembayaran
        Route::get('/keuangan/tagihan', [\App\Http\Controllers\Api\Wali\WaliKeuanganController::class, 'tagihan']);
        Route::post('/keuangan/checkout', [\App\Http\Controllers\Api\Wali\WaliKeuanganController::class, 'checkout']);
        Route::post('/keuangan/confirm-payment/{id}', [\App\Http\Controllers\Api\Wali\WaliKeuanganController::class, 'confirmPayment']);
        Route::get('/keuangan/uang-saku', [\App\Http\Controllers\Api\Wali\WaliKeuanganController::class, 'uangSaku']);
        Route::post('/keuangan/uang-saku/topup', [\App\Http\Controllers\Api\Wali\WaliKeuanganController::class, 'topUpUangSaku']);

        // Akademik, Nilai & Hafalan
        Route::get('/akademik/nilai', [\App\Http\Controllers\Api\Wali\WaliAkademikController::class, 'nilai']);
        Route::get('/akademik/tahfidz', [\App\Http\Controllers\Api\Wali\WaliAkademikController::class, 'tahfidz']);
        Route::get('/akademik/absensi', [\App\Http\Controllers\Api\Wali\WaliAkademikController::class, 'absensi']);

        // Perizinan Pulang Santri
        Route::get('/perizinan', [\App\Http\Controllers\Api\Wali\WaliPerizinanController::class, 'index']);
        Route::post('/perizinan', [\App\Http\Controllers\Api\Wali\WaliPerizinanController::class, 'store']);

        // Realtime Chat WA-Style
        Route::get('/chat/rooms', [\App\Http\Controllers\Api\Wali\WaliChatController::class, 'rooms']);
        Route::get('/chat/rooms/{roomId}/messages', [\App\Http\Controllers\Api\Wali\WaliChatController::class, 'messages']);
        Route::post('/chat/rooms/{roomId}/messages', [\App\Http\Controllers\Api\Wali\WaliChatController::class, 'sendMessage']);

        // Notifikasi Wali
        Route::get('/notifications', [\App\Http\Controllers\Api\Wali\WaliNotificationController::class, 'index']);
        Route::put('/notifications/{id}/read', [\App\Http\Controllers\Api\Wali\WaliNotificationController::class, 'markAsRead']);
    });
});


