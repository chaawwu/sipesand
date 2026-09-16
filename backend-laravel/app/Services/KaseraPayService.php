<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KaseraPayService
{
    protected string $apiKey;
    protected string $webhookSecret;
    protected string $baseUrl;
    protected int $timeout;

    public function __construct()
    {
        $this->apiKey = config('kaserapay.api_key') ?? '';
        $this->webhookSecret = config('kaserapay.webhook_secret') ?? '';
        $this->baseUrl = rtrim(config('kaserapay.base_url', 'https://pay.kasera.id/v1'), '/');
        $this->timeout = (int) config('kaserapay.timeout', 30);
    }

    /**
     * Membuat Transaksi KaseraPay
     *
     * @param array $payload [
     *   'external_id' => 'BILL-1234',
     *   'amount' => 500000,
     *   'customer_name' => 'Ahmad Santri',
     *   'customer_email' => 'wali@example.com',
     *   'customer_phone' => '08123456789',
     *   'description' => 'Pembayaran SPP Syahriyah',
     *   'payment_method' => 'QRIS' | 'VA' | 'ALL'
     * ]
     * @return array
     */
    public function createTransaction(array $payload): array
    {
        try {
            $url = "{$this->baseUrl}/transactions";

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->timeout($this->timeout)->post($url, $payload);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            Log::error('KaseraPay createTransaction error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'success' => false,
                'message' => $response->json('message') ?? 'Gagal membuat transaksi di KaseraPay',
                'raw' => $response->json(),
            ];
        } catch (\Throwable $e) {
            Log::error('KaseraPay Exception createTransaction: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Koneksi ke KaseraPay gagal: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Cek status transaksi langsung dari KaseraPay
     *
     * @param string $externalId
     * @return array
     */
    public function getTransactionStatus(string $externalId): array
    {
        try {
            $url = "{$this->baseUrl}/transactions/{$externalId}";

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Accept' => 'application/json',
            ])->timeout($this->timeout)->get($url);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => $response->json('message') ?? 'Transaksi tidak ditemukan',
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verifikasi signature webhook KaseraPay
     *
     * @param string $payloadJson
     * @param string|null $signatureHeader
     * @return bool
     */
    public function verifyWebhookSignature(string $payloadJson, ?string $signatureHeader): bool
    {
        if (empty($this->webhookSecret)) {
            return !app()->environment('production');
        }

        if (empty($signatureHeader)) {
            return false;
        }

        $expectedSignature = hash_hmac('sha256', $payloadJson, $this->webhookSecret);
        return hash_equals($expectedSignature, $signatureHeader);
    }
}
