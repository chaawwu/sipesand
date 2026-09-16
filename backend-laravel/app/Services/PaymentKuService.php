<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentKuService
{
    protected string $apiKey;
    protected string $webhookSecret;
    protected string $baseUrl;
    protected int $timeout;

    public function __construct()
    {
        $this->apiKey = config('paymentku.api_key') ?? '';
        $this->webhookSecret = config('paymentku.webhook_secret') ?? '';
        $this->baseUrl = rtrim(config('paymentku.base_url', 'https://paymenku.com/api/v1'), '/');
        $this->timeout = (int) config('paymentku.timeout', 30);
    }

    public function createTransaction(array $payload): array
    {
        if ($this->apiKey === '') {
            return ['success' => false, 'message' => 'PAYMENTKU_API_KEY belum dikonfigurasi.'];
        }

        try {
            $response = $this->client()
                ->withHeaders(['Idempotency-Key' => (string) ($payload['reference_id'] ?? '')])
                ->post("{$this->baseUrl}/transaction/create", $payload);

            if ($response->successful() && $response->json('status') === 'success') {
                return ['success' => true, 'data' => $response->json('data', []), 'raw' => $response->json()];
            }

            Log::error('PaymentKu create transaction failed', ['status' => $response->status(), 'body' => $response->body()]);
            return ['success' => false, 'message' => $response->json('message') ?? 'Gagal membuat transaksi PaymentKu.'];
        } catch (\Throwable $e) {
            Log::error('PaymentKu create transaction exception: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Koneksi ke PaymentKu gagal.'];
        }
    }

    public function getTransactionStatus(string $orderId): array
    {
        if ($this->apiKey === '') {
            return ['success' => false, 'message' => 'PAYMENTKU_API_KEY belum dikonfigurasi.'];
        }

        try {
            $response = $this->client()->get("{$this->baseUrl}/check-status/" . rawurlencode($orderId));
            if ($response->successful() && $response->json('status') === 'success') {
                return ['success' => true, 'data' => $response->json('data', []), 'raw' => $response->json()];
            }

            return ['success' => false, 'message' => $response->json('message') ?? 'Transaksi PaymentKu tidak ditemukan.'];
        } catch (\Throwable $e) {
            Log::error('PaymentKu status exception: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Koneksi ke PaymentKu gagal.'];
        }
    }

    public function verifyWebhookSignature(string $payloadJson, ?string $signatureHeader): bool
    {
        if ($this->webhookSecret === '') {
            return !app()->environment('production');
        }
        if (!$signatureHeader) return false;

        return hash_equals(hash_hmac('sha256', $payloadJson, $this->webhookSecret), $signatureHeader);
    }

    protected function client()
    {
        return Http::withToken($this->apiKey)->acceptJson()->asJson()->timeout($this->timeout);
    }
}