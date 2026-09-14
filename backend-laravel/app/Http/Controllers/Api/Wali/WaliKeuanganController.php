<?php

namespace App\Http\Controllers\Api\Wali;

use App\Http\Controllers\Controller;
use App\Models\Kwitansi;
use App\Models\Pembayaran;
use App\Models\Pesantren;
use App\Models\Santri;
use App\Models\UangSaku;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class WaliKeuanganController extends Controller
{
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
     * Checkout Pembayaran via KaseraPay / Payment Gateway
     */
    public function checkout(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bill_id' => 'required|exists:pembayarans,id',
            'channel' => 'nullable|string', // qris, bca_va, bni_va, mandiri_va
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

        $channel = $request->channel ?? 'qris_kasera';
        $externalId = 'KSR-' . strtoupper(Str::random(10));
        $checkoutUrl = "https://pay.kaserapay.com/checkout/{$externalId}?amount=" . (int)$bill->total_amount;

        // Update status tagihan ke pending
        $bill->update([
            'status' => 'pending',
            'payment_method' => 'kaserapay',
            'channel' => $channel,
            'payment_url' => $checkoutUrl,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Transaksi KaseraPay berhasil di-generate',
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
                'qr_string' => '00020101021226580016ID.CO.KASERAPAY.WWW011893600918000000000052045812530336054054525005802ID5918' . strtoupper($pesantren->name) . '6007JAKARTA6304E8A2',
            ],
        ]);
    }

    /**
     * Konfirmasi Pembayaran Tagihan (Simulasi Sukses / Verifikasi Otomatis)
     */
    public function confirmPayment(Request $request, $id)
    {
        $bill = Pembayaran::findOrFail($id);
        $wali = $request->user();
        $santri = Santri::find($bill->santri_id);
        $pesantren = Pesantren::find($wali->pesantren_id);

        $receiptNo = 'KW-' . date('Ym') . '-' . str_pad($bill->id, 4, '0', STR_PAD_LEFT);

        $bill->update([
            'status' => 'paid',
            'paid_at' => Carbon::now(),
            'verified_by' => 'Verifikasi Otomatis SiPesand KaseraPay',
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
     * Top Up Saldo Uang Saku
     */
    public function topUpUangSaku(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:10000',
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

        $amount = (float)$request->amount;
        $newBalance = (float)$santri->saldo_uang_saku + $amount;

        $santri->update(['saldo_uang_saku' => $newBalance]);

        $log = UangSaku::create([
            'pesantren_id' => $santri->pesantren_id,
            'santri_id' => $santri->id,
            'type' => 'topup',
            'amount' => $amount,
            'balance_after' => $newBalance,
            'description' => 'Top Up Saldo Saku via KaseraPay Online',
            'merchant_name' => 'KaseraPay Instant',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Top up uang saku berhasil dilakukan.',
            'data' => [
                'saldo_baru' => $newBalance,
                'transaksi' => $log,
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
