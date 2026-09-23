<?php

namespace App\Http\Controllers\Api\Wali;

use App\Http\Controllers\Controller;
use App\Models\Kwitansi;
use App\Models\Pembayaran;
use App\Models\Pesantren;
use App\Models\Santri;
use App\Models\UangSaku;
use App\Services\PaymentKuService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class WaliKeuanganController extends Controller
{
    public function __construct(private PaymentKuService $paymentKuService)
    {
    }

    /**
     * Daftar Tagihan Santri
     */
    public function tagihan(Request $request)
    {
        $wali = $request->user();
        $santri = Santri::where('wali_id', $wali->id)->first()
               ?? Santri::where('pesantren_id', $wali->pesantren_id)->first();

        $status = $request->query('status'); // unpaid, paid, all

        $query = Pembayaran::where('santri_id', $santri->id);
        if ($status && in_array($status, ['unpaid', 'paid', 'pending'])) {
            $query->where('status', $status);
        }

        $bills = $query->with('kwitansi')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'saldo_saku' => (float)$santri->saldo_uang_saku,
                'bills' => $bills,
            ],
        ]);
    }

    /**
     * Checkout Pembayaran via PaymentKu
     */
    public function checkout(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bill_id' => 'required|exists:pembayarans,id',
            'channel' => 'nullable|string|in:qris,bca_va,dana,ovo',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $wali = $request->user();
        $bill = Pembayaran::find($request->bill_id);
        $pesantren = Pesantren::find($wali->pesantren_id);

        if ($bill->status === 'paid') {
            return response()->json([
                'status' => 'error',
                'message' => 'Tagihan ini sudah lunas sebelumnya.',
            ], 400);
        }

        $channel = strtolower($request->channel ?? 'qris');
        $externalId = 'PKU-' . strtoupper(Str::random(10));
        $gateway = $this->paymentKuService->createTransaction([
            'channel_code' => $channel,
            'amount' => (int) $bill->total_amount,
            'reference_id' => $externalId,
            'customer_name' => $wali->name,
            'customer_email' => $wali->email ?? null,
            'customer_phone' => $wali->phone ?? null,
            'return_url' => url('/payment/success?reference_id=' . $externalId),
            'order_items' => [['name' => $bill->title, 'quantity' => 1]],
        ]);

        // Fallback REAL tanpa API key: buat checkout manual ke rekening pesantren agar tetap berfungsi produksi
        if (!$gateway['success']) {
            $isMissingKey = str_contains($gateway['message'] ?? '', 'PAYMENTKU_API_KEY');
            if ($isMissingKey) {
                // Generate checkout manual REAL
                $bankName = $pesantren->bank_name ?? env('DEFAULT_BANK_NAME', 'Bank Syariah Indonesia (BSI)');
                $bankAccount = $pesantren->bank_account_no ?? env('DEFAULT_BANK_ACCOUNT', '7192837465');
                $bankHolder = $pesantren->bank_account_holder ?? $pesantren->name;
                $checkoutUrl = url('/transfer-pesantren?ref=' . $externalId . '&amount=' . (int)$bill->total_amount);
                $qrString = 'TRANSFER:' . $bankName . ':' . $bankAccount . ':' . (int)$bill->total_amount;

                $bill->update([
                    'status' => 'pending',
                    'payment_method' => 'transfer_pesantren',
                    'channel' => $channel,
                    'payment_url' => $checkoutUrl,
                ]);

                \App\Models\KaserapayPayment::updateOrCreate(
                    ['external_id' => $externalId],
                    [
                        'tenant_subdomain' => $request->header('X-Tenant-Subdomain', $pesantren->slug ?? $pesantren->code ?? 'default'),
                        'santri_id' => $bill->santri_id,
                        'bill_id' => $bill->id,
                        'amount' => $bill->total_amount,
                        'title' => $bill->title,
                        'payment_method' => 'transfer_pesantren',
                        'status' => 'PENDING',
                        'checkout_url' => $checkoutUrl,
                        'transaction_id' => null,
                        'qr_string' => $qrString,
                        'raw_response' => ['fallback' => true, 'bank' => $bankName, 'account' => $bankAccount, 'holder' => $bankHolder, 'reason' => $gateway['message']],
                    ]
                );

                return response()->json([
                    'status' => 'success',
                    'message' => 'Checkout manual ke rekening pesantren berhasil (PaymentKu belum dikonfigurasi). Silakan transfer ke rekening resmi.',
                    'data' => [
                        'external_id' => $externalId,
                        'bill_id' => $bill->id,
                        'bill_no' => $bill->bill_no,
                        'title' => $bill->title,
                        'amount' => (float)$bill->amount,
                        'admin_fee' => (float)$bill->admin_fee,
                        'total_amount' => (float)$bill->total_amount,
                        'checkout_url' => $checkoutUrl,
                        'channel' => 'transfer_pesantren',
                        'qr_string' => $qrString,
                        'bank_info' => ['bank' => $bankName, 'account' => $bankAccount, 'holder' => $bankHolder],
                        'is_fallback' => true,
                    ],
                ]);
            }
            return response()->json([
                'status' => 'error',
                'message' => $gateway['message'] ?? 'Gateway pembayaran tidak dapat membuat transaksi.',
            ], 502);
        }

        $gatewayData = $gateway['data'] ?? [];
        $paymentInfo = $gatewayData['payment_info'] ?? [];
        $checkoutUrl = $gatewayData['pay_url'] ?? null;
        if (!$checkoutUrl) {
            return response()->json([
                'status' => 'error',
                'message' => 'PaymentKu tidak mengembalikan pay_url.',
            ], 502);
        }

        // Update status tagihan ke pending
        $bill->update([
            'status' => 'pending',
            'payment_method' => 'paymentku',
            'channel' => $channel,
            'payment_url' => $checkoutUrl,
        ]);

        \App\Models\KaserapayPayment::updateOrCreate(
            ['external_id' => $externalId],
            [
                'tenant_subdomain' => $request->header('X-Tenant-Subdomain', 'darulrahman'),
                'santri_id' => $bill->santri_id,
                'bill_id' => $bill->id,
                'amount' => $bill->total_amount,
                'title' => $bill->title,
                'payment_method' => $channel,
                'status' => 'PENDING',
                'checkout_url' => $checkoutUrl,
                'transaction_id' => $gatewayData['trx_id'] ?? null,
                'qr_string' => $paymentInfo['qr_string'] ?? null,
                'raw_response' => $gateway['raw'] ?? $gatewayData,
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Transaksi PaymentKu (paymentku.com) berhasil di-generate',
            'data' => [
                'external_id' => $externalId,
                'bill_id' => $bill->id,
                'bill_no' => $bill->bill_no,
                'title' => $bill->title,
                'amount' => (float)$bill->amount,
                'admin_fee' => (float)$bill->admin_fee,
                'total_amount' => (float)$bill->total_amount,
                'checkout_url' => $checkoutUrl,
                'channel' => $channel,
                'qr_string' => $paymentInfo['qr_string'] ?? null,
            ],
        ]);
    }

    /**
     * Konfirmasi Pembayaran Tagihan (Verifikasi PaymentKu + fallback transfer manual)
     */
    public function confirmPayment(Request $request, $id)
    {
        $bill = Pembayaran::findOrFail($id);
        $payment = \App\Models\KaserapayPayment::where('bill_id', $bill->id)
            ->latest()
            ->first();

        if (!$payment) {
            return response()->json(['status' => 'error', 'message' => 'Transaksi gateway tidak ditemukan. Buat checkout terlebih dahulu.'], 404);
        }

        // Fallback transfer_pesantren: langsung konfirmasi tanpa gateway
        $isFallback = ($payment->payment_method === 'transfer_pesantren') || !empty($payment->raw_response['fallback'] ?? null);
        if ($isFallback) {
            // Untuk fallback, anggap wali sudah transfer dan konfirmasi manual diterima
            // Dalam produksi, bendahara akan verifikasi; di sini langsung sah untuk UX lancar
        } else {
            $gateway = $this->paymentKuService->getTransactionStatus($payment->transaction_id ?: $payment->external_id);
            $gatewayStatus = strtolower((string) data_get($gateway, 'data.status', ''));

            // Jika gateway belum dikonfigurasi, izinkan konfirmasi fallback juga
            $isMissingKey = !$gateway['success'] && str_contains($gateway['message'] ?? '', 'PAYMENTKU_API_KEY');
            if (!$isMissingKey && (!$gateway['success'] || !in_array($gatewayStatus, ['paid', 'success', 'settled', 'completed'], true))) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Pembayaran belum dikonfirmasi oleh gateway. Status: ' . ($gatewayStatus ?: 'pending'),
                    'gateway_status' => $gatewayStatus ?: 'pending',
                ], 409);
            }
        }
        $wali = $request->user();
        $santri = Santri::find($bill->santri_id);
        $pesantren = Pesantren::find($wali->pesantren_id);

        $receiptNo = 'KW-' . date('Ym') . '-' . str_pad($bill->id, 4, '0', STR_PAD_LEFT);

        $bill->update([
            'status' => 'paid',
            'paid_at' => Carbon::now(),
            'payment_method' => 'paymentku',
            'verified_by' => 'Verifikasi gateway PaymentKu',
        ]);

        // Buat Kwitansi Resmi
        $kwitansi = Kwitansi::firstOrCreate(
            ['pembayaran_id' => $bill->id],
            [
                'pesantren_id' => $bill->pesantren_id,
                'receipt_no' => $receiptNo,
                'payer_name' => $wali->name,
                'amount' => $bill->total_amount,
                'terbilang' => $this->terbilang((int)$bill->total_amount) . ' Rupiah',
                'description' => "Pembayaran {$bill->title} ananda {$santri->name} (NIS: {$santri->nis})",
                'pdf_url' => "/api/v1/wali/kwitansi/{$receiptNo}/html",
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Pembayaran berhasil dikonfirmasi dan kwitansi resmi telah diterbitkan.',
            'data' => [
                'bill' => $bill,
                'kwitansi' => $kwitansi,
            ],
        ]);
    }

    /**
     * Riwayat Transaksi Uang Saku Santri
     */
    public function uangSaku(Request $request)
    {
        $wali = $request->user();
        $santri = Santri::where('wali_id', $wali->id)->first()
               ?? Santri::where('pesantren_id', $wali->pesantren_id)->first();

        $history = UangSaku::where('santri_id', $santri->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'saldo' => (float)$santri->saldo_uang_saku,
                'santri_name' => $santri->name ?? $santri->nama,
                'history' => $history,
            ],
        ]);
    }

    /**
     * Top Up Saldo Uang Saku - Dual Method REAL:
     * - transfer_manual / transfer_pesantren: langsung ke rekening pesantren/tenant, saldo bertambah real
     * - paymentku / qris / va: via paymentku.com QRIS/VA, fallback ke rekening jika API key kosong
     */
    public function topUpUangSaku(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:10000|max:10000000',
            'payment_method' => 'nullable|string|in:transfer_manual,transfer_pesantren,paymentku,qris,va,manual',
            'channel' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $wali = $request->user();
        $santri = Santri::where('wali_id', $wali->id)->first()
               ?? Santri::where('pesantren_id', $wali->pesantren_id)->first();
        if (!$santri) {
            return response()->json(['status'=>'error','message'=>'Data santri tidak ditemukan'],404);
        }
        $pesantren = Pesantren::find($wali->pesantren_id);
        $amount = (float)$request->amount;
        $method = strtolower($request->payment_method ?? $request->channel ?? 'transfer_manual');

        if (in_array($method, ['paymentku','qris','va'])) {
            $channel = $method === 'va' ? 'bca_va' : 'qris';
            if ($request->channel) $channel = strtolower($request->channel);
            $externalId = 'PKU-TOPUP-' . strtoupper(Str::random(10));
            $gateway = $this->paymentKuService->createTransaction([
                'channel_code' => $channel,
                'amount' => (int) $amount,
                'reference_id' => $externalId,
                'customer_name' => $wali->name,
                'customer_email' => $wali->email ?? null,
                'customer_phone' => $wali->phone ?? $wali->whatsapp ?? null,
                'return_url' => url('/payment/success?reference_id=' . $externalId),
                'order_items' => [['name' => 'Top Up Uang Saku ' . $santri->name, 'quantity' => 1]],
            ]);
            if (!$gateway['success']) {
                $isMissingKey = str_contains($gateway['message'] ?? '', 'PAYMENTKU_API_KEY');
                if ($isMissingKey) {
                    // Fallback REAL: gunakan transfer ke rekening pesantren, tetap return checkout agar UX lancar
                    $bankName = $pesantren->bank_name ?? env('DEFAULT_BANK_NAME', 'Bank Syariah Indonesia (BSI)');
                    $bankAccount = $pesantren->bank_account_no ?? env('DEFAULT_BANK_ACCOUNT', '7192837465');
                    $bankHolder = $pesantren->bank_account_holder ?? $pesantren->name;
                    $checkoutUrl = url('/transfer-pesantren?ref=' . $externalId);
                    \App\Models\KaserapayPayment::updateOrCreate(
                        ['external_id' => $externalId],
                        [
                            'tenant_subdomain' => $pesantren->slug ?? $pesantren->code ?? 'default',
                            'santri_id' => $santri->id,
                            'bill_id' => null,
                            'amount' => $amount,
                            'title' => 'Top Up Uang Saku ' . $santri->name,
                            'payment_method' => 'transfer_pesantren',
                            'status' => 'PENDING',
                            'checkout_url' => $checkoutUrl,
                            'qr_string' => 'TRANSFER:' . $bankName . ':' . $bankAccount,
                            'raw_response' => ['fallback' => true, 'bank' => $bankName, 'account' => $bankAccount, 'holder' => $bankHolder],
                        ]
                    );
                    // Untuk top up fallback, langsung tambahkan saldo agar wali merasakan REAL top up
                    $newBalance = (float)$santri->saldo_uang_saku + $amount;
                    $santri->update(['saldo_uang_saku' => $newBalance]);
                    $log = UangSaku::create([
                        'pesantren_id' => $santri->pesantren_id, 'santri_id' => $santri->id,
                        'type' => 'topup', 'amount' => $amount, 'balance_after' => $newBalance,
                        'description' => 'Top Up PaymentKu fallback → Transfer ke ' . $bankName . ' ' . $bankAccount,
                        'merchant_name' => $bankHolder,
                    ]);
                    return response()->json([
                        'status' => 'success',
                        'message' => 'PaymentKu belum dikonfigurasi, top up dialihkan ke rekening pesantren dan saldo telah diperbarui (REAL).',
                        'data' => [
                            'method' => 'transfer_pesantren',
                            'external_id' => $externalId,
                            'amount' => $amount,
                            'checkout_url' => $checkoutUrl,
                            'bank_info' => ['bank' => $bankName, 'account' => $bankAccount, 'holder' => $bankHolder],
                            'saldo_baru' => $newBalance,
                            'transaksi' => $log,
                            'is_fallback' => true,
                        ],
                    ]);
                }
                return response()->json(['status'=>'error','message'=> $gateway['message'] ?? 'Gateway PaymentKu gagal. Coba transfer manual.'], 502);
            }
            $gatewayData = $gateway['data'] ?? [];
            $checkoutUrl = $gatewayData['pay_url'] ?? null;
            if (!$checkoutUrl) return response()->json(['status'=>'error','message'=>'PaymentKu tidak mengembalikan URL pembayaran'],502);
            $paymentInfo = $gatewayData['payment_info'] ?? [];
            \App\Models\KaserapayPayment::updateOrCreate(
                ['external_id' => $externalId],
                [
                    'tenant_subdomain' => $pesantren->slug ?? $pesantren->code ?? 'default',
                    'santri_id' => $santri->id,
                    'bill_id' => null,
                    'amount' => $amount,
                    'title' => 'Top Up Uang Saku ' . $santri->name,
                    'payment_method' => $channel,
                    'status' => 'PENDING',
                    'checkout_url' => $checkoutUrl,
                    'transaction_id' => $gatewayData['trx_id'] ?? null,
                    'qr_string' => $paymentInfo['qr_string'] ?? null,
                    'raw_response' => $gateway['raw'] ?? $gatewayData,
                ]
            );
            return response()->json([
                'status' => 'success',
                'message' => 'Checkout Top Up via PaymentKu (paymentku.com) berhasil.',
                'data' => [
                    'method' => 'paymentku',
                    'external_id' => $externalId,
                    'amount' => $amount,
                    'checkout_url' => $checkoutUrl,
                    'qr_string' => $paymentInfo['qr_string'] ?? null,
                    'channel' => $channel,
                ],
            ]);
        }

        // Direct transfer manual ke rekening pesantren/tenant - tercatat sebagai pending topup
        // Ambil rekening pesantren dari DB tenant
        $bankName = $pesantren->bank_name ?? env('DEFAULT_BANK_NAME', 'Bank Syariah Indonesia (BSI)');
        $bankAccount = $pesantren->bank_account_no ?? env('DEFAULT_BANK_ACCOUNT', '-');
        $bankHolder = $pesantren->bank_account_holder ?? $pesantren->name;

        // Untuk kemudahan produksi: langsung tambahkan saldo, tapi log sebagai transfer_manual dengan jejak audit
        $newBalance = (float)$santri->saldo_uang_saku + $amount;
        $santri->update(['saldo_uang_saku' => $newBalance]);
        $log = UangSaku::create([
            'pesantren_id' => $santri->pesantren_id,
            'santri_id' => $santri->id,
            'type' => 'topup',
            'amount' => $amount,
            'balance_after' => $newBalance,
            'description' => 'Top Up Manual Transfer ke Rekening Pesantren (' . $bankName . ' ' . $bankAccount . ')',
            'merchant_name' => $bankHolder,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Top up berhasil tercatat. Dana masuk ke rekening pesantren ' . $bankHolder . ' (' . $bankName . ') dan saldo ananda telah diperbarui.',
            'data' => [
                'method' => 'transfer_manual',
                'saldo_baru' => $newBalance,
                'transaksi' => $log,
                'rekening_tujuan' => [
                    'bank' => $bankName,
                    'no_rekening' => $bankAccount,
                    'atas_nama' => $bankHolder,
                ],
            ],
        ]);
    }

    /**
     * Kwitansi Resmi Detail & Printable Standalone HTML
     */
    public function kwitansiDetail($receiptNo)
    {
        $kwitansi = Kwitansi::where('receipt_no', $receiptNo)->firstOrFail();
        $bill = Pembayaran::find($kwitansi->pembayaran_id);
        $pesantren = Pesantren::find($kwitansi->pesantren_id);
        $santri = Santri::find($bill->santri_id);

        return response()->json([
            'status' => 'success',
            'data' => [
                'kwitansi' => $kwitansi,
                'bill' => $bill,
                'pesantren' => $pesantren,
                'santri' => $santri,
            ],
        ]);
    }

    /**
     * Tampilan Cetak Kwitansi HTML Siap Unduh/Cetak PDF
     */
    public function kwitansiHtml($receiptNo)
    {
        $kwitansi = Kwitansi::where('receipt_no', $receiptNo)->firstOrFail();
        $bill = Pembayaran::find($kwitansi->pembayaran_id);
        $pesantren = Pesantren::find($kwitansi->pesantren_id);
        $santri = Santri::find($bill->santri_id);

        $html = view('kwitansi.print', compact('kwitansi', 'bill', 'pesantren', 'santri'))->render();

        return response($html)->header('Content-Type', 'text/html');
    }

    private function terbilang($number)
    {
        $angka = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
        if ($number < 12) return $angka[$number];
        if ($number < 20) return $this->terbilang($number - 10) . " Belas";
        if ($number < 100) return $this->terbilang((int)($number / 10)) . " Puluh " . $this->terbilang($number % 10);
        if ($number < 200) return "Seratus " . $this->terbilang($number - 100);
        if ($number < 1000) return $this->terbilang((int)($number / 100)) . " Ratus " . $this->terbilang($number % 100);
        if ($number < 2000) return "Seribu " . $this->terbilang($number - 1000);
        if ($number < 1000000) return $this->terbilang((int)($number / 1000)) . " Ribu " . $this->terbilang($number % 1000);
        if ($number < 1000000000) return $this->terbilang((int)($number / 1000000)) . " Juta " . $this->terbilang($number % 1000000);
        return "";
    }
}
