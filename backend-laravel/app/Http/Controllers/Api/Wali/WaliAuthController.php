<?php

namespace App\Http\Controllers\Api\Wali;

use App\Http\Controllers\Controller;
use App\Models\Pesantren;
use App\Models\Santri;
use App\Models\WaliSantri;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WaliAuthController extends Controller
{
    /**
     * Cari / Pilih Pondok Pesantren (Multi-tenant master)
     */
    public function pesantrens(Request $request)
    {
        $query = Pesantren::where('is_active', true);

        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        $pesantrens = $query->select(['id', 'code', 'name', 'slug', 'phone', 'address', 'logo_url', 'banner_url'])
            ->orderBy('name')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $pesantrens,
        ]);
    }

    /**
     * Request WhatsApp OTP
     */
    public function requestOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pesantren_id' => 'required|exists:pesantrens,id',
            'whatsapp' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $cleanPhone = preg_replace('/[^0-9]/', '', $request->whatsapp);
        if (str_starts_with($cleanPhone, '62')) {
            $cleanPhone = '0' . substr($cleanPhone, 2);
        }

        $wali = WaliSantri::where('pesantren_id', $request->pesantren_id)
            ->where(function ($q) use ($cleanPhone, $request) {
                $q->where('whatsapp', $cleanPhone)
                  ->orWhere('whatsapp', $request->whatsapp);
            })
            ->first();

        // For demo/production testing, generate OTP (default 123456 or random 6-digit)
        $otp = '123456';
        $expiresAt = Carbon::now()->addMinutes(15);

        if ($wali) {
            $wali->update([
                'otp_code' => $otp,
                'otp_expires_at' => $expiresAt,
            ]);
        }

        // WhatsApp Gateway webhook / API integration (e.g. Fonnte / Wablas) can be called here
        return response()->json([
            'status' => 'success',
            'message' => 'Kode OTP berhasil dikirim ke nomor WhatsApp Anda (Gunakan: 123456)',
            'data' => [
                'whatsapp' => $request->whatsapp,
                'is_registered' => (bool)$wali,
                'demo_otp' => '123456',
            ],
        ]);
    }

    /**
     * Verify OTP & Login (Sanctum Token + Multi Device)
     */
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pesantren_id' => 'required|exists:pesantrens,id',
            'whatsapp' => 'required|string',
            'otp' => 'required|string',
            'device_name' => 'nullable|string',
            'fcm_token' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $cleanPhone = preg_replace('/[^0-9]/', '', $request->whatsapp);
        if (str_starts_with($cleanPhone, '62')) {
            $cleanPhone = '0' . substr($cleanPhone, 2);
        }

        $wali = WaliSantri::where('pesantren_id', $request->pesantren_id)
            ->where(function ($q) use ($cleanPhone, $request) {
                $q->where('whatsapp', $cleanPhone)
                  ->orWhere('whatsapp', $request->whatsapp);
            })
            ->first();

        if (!$wali) {
            return response()->json([
                'status' => 'unregistered',
                'message' => 'Nomor WhatsApp belum terdaftar. Silakan registrasi terlebih dahulu.',
            ], 404);
        }

        // Check OTP (allow 123456 or matching OTP code)
        if ($request->otp !== '123456' && $wali->otp_code !== $request->otp) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kode OTP tidak valid atau sudah kedaluwarsa.',
            ], 401);
        }

        if ($request->fcm_token) {
            $wali->update(['fcm_token' => $request->fcm_token]);
        }

        $deviceName = $request->device_name ?? ($request->header('User-Agent') ?? 'Android Device');
        $token = $wali->createToken($deviceName)->plainTextToken;

        // Fetch Santri
        $santri = Santri::where('wali_id', $wali->id)->first() ?? Santri::where('pesantren_id', $wali->pesantren_id)->first();
        $pesantren = Pesantren::find($wali->pesantren_id);

        return response()->json([
            'status' => 'success',
            'message' => 'Login berhasil. Selamat datang di Ananda SiPesand.',
            'data' => [
                'token' => $token,
                'wali' => [
                    'id' => $wali->id,
                    'name' => $wali->name,
                    'whatsapp' => $wali->whatsapp,
                    'relationship' => $wali->relationship,
                    'is_verified' => (bool)$wali->is_verified,
                    'avatar_url' => $wali->avatar_url,
                ],
                'santri' => $santri ? [
                    'id' => $santri->id,
                    'nis' => $santri->nis,
                    'name' => $santri->name ?? $santri->nama,
                    'kelas' => $santri->kelas,
                    'kamar' => $santri->kamar,
                    'musyrif_name' => $santri->musyrif_name,
                    'musyrif_phone' => $santri->musyrif_phone,
                    'photo_url' => $santri->photo_url,
                    'status' => $santri->status,
                    'saldo_uang_saku' => (float)$santri->saldo_uang_saku,
                ] : null,
                'pesantren' => [
                    'id' => $pesantren->id,
                    'name' => $pesantren->name,
                    'code' => $pesantren->code,
                    'logo_url' => $pesantren->logo_url,
                ],
            ],
        ]);
    }

    /**
     * Registrasi Wali Santri
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pesantren_id' => 'required|exists:pesantrens,id',
            'name' => 'required|string|max:255',
            'whatsapp' => 'required|string|max:20',
            'relationship' => 'required|string|in:Ayah,Ibu,Wali',
            'address' => 'nullable|string',
            'nama_ananda' => 'required|string|max:255',
            'nis_ananda' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $cleanPhone = preg_replace('/[^0-9]/', '', $request->whatsapp);

        $wali = WaliSantri::create([
            'pesantren_id' => $request->pesantren_id,
            'name' => $request->name,
            'whatsapp' => $cleanPhone,
            'relationship' => $request->relationship,
            'address' => $request->address,
            'is_verified' => false,
            'avatar_url' => 'https://ui-avatars.com/api/?name=' . urlencode($request->name) . '&background=07266E&color=fff',
        ]);

        // Hubungkan atau buat data santri sementara menunggu verifikasi admin
        $santri = null;
        if ($request->nis_ananda) {
            $santri = Santri::where('pesantren_id', $request->pesantren_id)
                ->where('nis', $request->nis_ananda)
                ->first();
            if ($santri) {
                $santri->update(['wali_id' => $wali->id]);
            }
        }

        if (!$santri) {
            $santri = Santri::create([
                'pesantren_id' => $request->pesantren_id,
                'wali_id' => $wali->id,
                'nis' => $request->nis_ananda ?? ('REG-' . time()),
                'name' => $request->nama_ananda,
                'nama' => $request->nama_ananda,
                'kelas' => 'Santri Baru (Proses Verifikasi)',
                'kamar' => 'Menunggu Penempatan',
                'status' => 'Aktif',
                'saldo_uang_saku' => 0,
            ]);
        }

        $token = $wali->createToken('Android Device')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Registrasi berhasil. Data Anda sedang diverifikasi oleh admin pesantren.',
            'data' => [
                'token' => $token,
                'wali' => $wali,
                'santri' => $santri,
            ],
        ], 201);
    }

    /**
     * Get Current Authenticated Profile
     */
    public function me(Request $request)
    {
        $wali = $request->user();
        $santri = Santri::where('wali_id', $wali->id)->first() ?? Santri::where('pesantren_id', $wali->pesantren_id)->first();
        $pesantren = Pesantren::find($wali->pesantren_id);

        return response()->json([
            'status' => 'success',
            'data' => [
                'wali' => $wali,
                'santri' => $santri,
                'pesantren' => $pesantren,
            ],
        ]);
    }
}
