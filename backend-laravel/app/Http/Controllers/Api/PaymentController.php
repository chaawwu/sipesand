<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentKu;
use App\Models\Santri;
use App\Services\PaymentKuService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    protected PaymentKuService $paymentKuService;

    public function __construct(PaymentKuService $paymentKuService)
    {
        $this->paymentKuService = $paymentKuService;
    }

    /**
     * POST /api/payments/create
    * Menghasilkan transaksi PaymentKu (Checkout URL / QRIS / VA)
     */
    public function create(Request $request)
    {
        $validated = $request->validate([
            'santri_id' => 'nullable|exists:santris,id',
            'bill_id' => 'nullable|string',
            'amount' => 'required|numeric|min:1000',
            'title' => 'required|string',
            'customer_name' => 'required|string',
            'customer_phone' => 'nullable|string',
            'customer_email' => 'nullable|email',
            'payment_method' => 'nullable|string|in:qris,bca_va,dana,ovo',
            'tenant' => 'nullable|string',
        ]);

        $tenant = $validated['tenant'] ?? $request->header('X-Tenant-Subdomain', 'darulrahman');
        $externalId = 'SIPESAND-' . strtoupper(Str::random(6)) . '-' . time();

        // 1. Panggil KaseraPay API
        $channel = strtolower($validated['payment_method'] ?? 'qris');
        $paymentKuPayload = [
            'channel_code' => $channel,
            'amount' => (int) $validated['amount'],
            'reference_id' => $externalId,
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'] ?? null,
            'customer_email' => $validated['customer_email'] ?? 'wali@sipesand.web.id',
            'return_url' => "https://sipesand.web.id/payment/success?reference_id={$externalId}",
            'order_items' => [['name' => $validated['title'], 'quantity' => 1]],
        ];

        $paymentKuRes = $this->paymentKuService->createTransaction($paymentKuPayload);
        if (!$paymentKuRes['success']) {
            return response()->json(['status' => 'error', 'message' => $paymentKuRes['message']], 502);
        }

        $data = $paymentKuRes['data'];
        $paymentInfo = $data['payment_info'] ?? [];
        $checkoutUrl = $data['pay_url'] ?? null;
        $qrString = $paymentInfo['qr_string'] ?? null;
        $transactionId = $data['trx_id'] ?? null;

        // 2. Simpan record di database
        $payment = PaymentKu::create([
            'tenant_subdomain' => $tenant,
            'santri_id' => $validated['santri_id'] ?? null,
            'bill_id' => $validated['bill_id'] ?? null,
            'external_id' => $externalId,
            'transaction_id' => $transactionId,
            'amount' => $validated['amount'],
            'title' => $validated['title'],
            'payment_method' => $channel,
            'status' => 'PENDING',
            'checkout_url' => $checkoutUrl,
            'qr_string' => $qrString,
            'raw_response' => $paymentKuRes['raw'] ?? $data,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Transaksi PaymentKu berhasil dibuat',
            'data' => [
                'id' => $payment->id,
                'external_id' => $externalId,
                'amount' => (float) $payment->amount,
                'title' => $payment->title,
                'status' => $payment->status,
                'checkout_url' => $checkoutUrl,
                'qr_string' => $qrString,
                'created_at' => $payment->created_at->toISOString(),
            ],
        ], 201);
    }

    /**
     * GET /api/payments/status/{external_id}
     * Cek status pembayaran santri
     */
    public function status(string $externalId)
    {
        $payment = KaserapayPayment::where('external_id', $externalId)->first();

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Data pembayaran tidak ditemukan',
            ], 404);
        }

        // Cek status terbaru ke KaseraPay jika masih PENDING
        if ($payment->status === 'PENDING') {
            $checkRes = $this->paymentKuService->getTransactionStatus($payment->transaction_id ?: $externalId);
            if ($checkRes['success'] && isset($checkRes['data']['status'])) {
                $statusRemote = strtoupper($checkRes['data']['status']);
                if (in_array($statusRemote, ['PAID', 'SUCCESS', 'SETTLED'])) {
                    $payment->status = 'PAID';
                    $payment->paid_at = now();
                    $payment->save();
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'external_id' => $payment->external_id,
                'bill_id' => $payment->bill_id,
                'amount' => (float) $payment->amount,
                'status' => $payment->status,
                'paid_at' => $payment->paid_at?->toISOString(),
                'checkout_url' => $payment->checkout_url,
            ],
        ]);
    }

    /**
     * GET /api/payments/history
     * Riwayat pembayaran tagihan santri
     */
    public function history(Request $request)
    {
        $tenant = $request->query('tenant', $request->header('X-Tenant-Subdomain', 'darulrahman'));
        $status = $request->query('status');

        $query = KaserapayPayment::with('santri')
            ->where('tenant_subdomain', $tenant);

        if ($status) {
            $query->where('status', strtoupper($status));
        }

        $payments = $query->latest()->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $payments,
        ]);
    }
}
