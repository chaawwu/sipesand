<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KaserapayPayment;
use App\Models\Pembayaran;
use App\Services\PaymentKuService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    protected PaymentKuService $paymentKuService;

    public function __construct(PaymentKuService $paymentKuService)
    {
        $this->paymentKuService = $paymentKuService;
    }

    /**
     * POST /api/payments/webhook
    * Menerima notifikasi pembayaran realtime dari PaymentKu
     */
    public function handle(Request $request)
    {
        $rawPayload = $request->getContent();
        $signature = $request->header('X-Signature') ?? $request->header('X-Paymenku-Signature');

        Log::info('PaymentKu Webhook Received', [
            'signature' => $signature,
            'body' => $request->all(),
        ]);

        // 1. Verifikasi Signature
        if (!$this->paymentKuService->verifyWebhookSignature($rawPayload, $signature)) {
            Log::warning('PaymentKu Webhook Invalid Signature', ['header' => $signature]);
            return response()->json(['status' => 'error', 'message' => 'Invalid signature'], 401);
        }

        $event = strtolower((string) ($request->input('status') ?? $request->input('data.status')));
        $externalId = $request->input('reference_id') ?? $request->input('data.reference_id');
        $transactionId = $request->input('trx_id') ?? $request->input('data.trx_id');

        if (!$externalId) {
            return response()->json(['status' => 'error', 'message' => 'Missing reference_id'], 400);
        }

        $payment = KaserapayPayment::where('external_id', $externalId)->first();

        if (!$payment) {
            Log::warning("PaymentKu payment with reference_id {$externalId} not found");
            return response()->json(['status' => 'error', 'message' => 'Payment record not found'], 404);
        }

        // 2. Proses status pembayaran dari status resmi PaymentKu.
        $isPaid = in_array($event, ['paid', 'success', 'settled', 'completed'], true);

        if ($isPaid) {
            $payment->status = 'PAID';
            $payment->paid_at = now();
            $payment->transaction_id = $transactionId ?: $payment->transaction_id;
            $payment->payment_method = $request->input('channel_code') ?? $request->input('data.channel_code') ?? $payment->payment_method;
            $payment->raw_response = $request->all();
            $payment->save();

            if ($payment->bill_id) {
                Pembayaran::whereKey($payment->bill_id)->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                    'payment_method' => $payment->payment_method,
                    'verified_by' => 'Webhook gateway terverifikasi',
                ]);
            }

            Log::info("PaymentKu payment {$externalId} set to PAID successfully.");
        } elseif (in_array($event, ['failed', 'expired', 'cancelled'], true)) {
            $payment->status = strtoupper($event);
            $payment->save();
        }

        return response()->json([
            'status' => 'success',
            'data' => ['reference_id' => $externalId, 'status' => $payment->status],
        ]);
    }
}
