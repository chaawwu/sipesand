<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KaserapayPayment;
use App\Services\KaseraPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    protected KaseraPayService $kaseraPayService;

    public function __construct(KaseraPayService $kaseraPayService)
    {
        $this->kaseraPayService = $kaseraPayService;
    }

    /**
     * POST /api/payments/webhook
     * Menerima notifikasi pembayaran realtime dari KaseraPay
     */
    public function handle(Request $request)
    {
        $rawPayload = $request->getContent();
        $signature = $request->header('X-Signature') ?? $request->header('X-Kaserapay-Signature');

        Log::info('KaseraPay Webhook Received', [
            'signature' => $signature,
            'body' => $request->all(),
        ]);

        // 1. Verifikasi Signature
        if (!$this->kaseraPayService->verifyWebhookSignature($rawPayload, $signature)) {
            Log::warning('KaseraPay Webhook Invalid Signature', ['header' => $signature]);
            return response()->json(['success' => false, 'message' => 'Invalid signature'], 401);
        }

        $event = $request->input('event') ?? $request->input('status');
        $externalId = $request->input('external_id') ?? $request->input('data.external_id');

        if (!$externalId) {
            return response()->json(['success' => false, 'message' => 'Missing external_id'], 400);
        }

        $payment = KaserapayPayment::where('external_id', $externalId)->first();

        if (!$payment) {
            Log::warning("KaseraPay Payment with external_id {$externalId} not found");
            return response()->json(['success' => false, 'message' => 'Payment record not found'], 404);
        }

        // 2. Proses status pembayaran
        // Event KaseraPay: payment.paid, PAID, SUCCESS, SETTLED
        $isPaid = in_array(strtolower($event), ['payment.paid', 'paid', 'success', 'settled']) ||
                  in_array(strtolower($request->input('data.status', '')), ['paid', 'success', 'settled']);

        if ($isPaid) {
            $payment->status = 'PAID';
            $payment->paid_at = now();
            $payment->transaction_id = $request->input('id') ?? $request->input('data.id') ?? $payment->transaction_id;
            $payment->payment_method = $request->input('payment_method') ?? $request->input('data.payment_method') ?? $payment->payment_method;
            $payment->raw_response = $request->all();
            $payment->save();

            Log::info("KaseraPay Payment {$externalId} set to PAID successfully.");
        } elseif (in_array(strtolower($event), ['payment.failed', 'failed', 'expired'])) {
            $payment->status = 'FAILED';
            $payment->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Webhook processed successfully',
            'external_id' => $externalId,
            'status' => $payment->status,
        ]);
    }
}
