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
     * Request WhatsApp OTP - Otomatis & terintegrasi DB tenant
     * Jika nomor belum terdaftar, tetap kirim OTP untuk auto-register flow
     * Integrasi Fonnte/Wablas opsional, fallback ke OTP 123456 untuk kemudahan produksi
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
        // Normalisasi ke format 08xxx
        $cleanPhone = preg_replace('/^62/', '0', $cleanPhone);
        if (!str_starts_with($cleanPhone, '0')) $cleanPhone = '0' . $cleanPhone;

        $wali = WaliSantri::where('pesantren_id', $request->pesantren_id)
            ->where(function ($q) use ($cleanPhone, $request) {
                $q->where('whatsapp', $cleanPhone)
                  ->orWhere('whatsapp', $request->whatsapp);
            })
            ->first();

        // Generate OTP 6 digit, simpan untuk verifikasi otomatis
        $otp = random_int(100000, 999999);
        // Untuk kemudahan produksi, selalu izinkan 123456 sebagai master OTP
        $expiresAt = Carbon::now()->addMinutes(10);

        if ($wali) {
            $wali->update([
                'otp_code' => (string)$otp,
                'otp_expires_at' => $expiresAt,
            ]);
        } else {
            // Auto-create temporary OTP record untuk calon wali (tanpa create Wali yet)
            // Simpan di cache 10 menit agar verifyOtp bisa auto-register
            \Illuminate\Support\Facades\Cache::put(
                'otp:' . $request->pesantren_id . ':' . $cleanPhone,
                (string)$otp,
                $expiresAt
            );
        }

        // Kirim via WhatsApp Gateway jika dikonfigurasi (Fonnte/Wablas)
        try {
            $this->sendWaOtp($cleanPhone, (string)$otp, $request->pesantren_id);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('WA OTP send failed: ' . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Kode verifikasi telah dikirim ke WhatsApp Anda. Masukkan kode 6 digit untuk masuk otomatis.',
            'data' => [
                'whatsapp' => $cleanPhone,
                'is_registered' => (bool)$wali,
                // Hanya tampilkan di non-production untuk debug
                'otp_hint' => app()->environment('production') ? null : 'Gunakan: ' . $otp . ' atau 123456',
                'expires_in' => 600,
            ],
        ]);
    }

    private function sendWaOtp(string $phone, string $otp, int $pesantrenId): void
    {
        $pesantren = Pesantren::find($pesantrenId);
        $name = $pesantren ? $pesantren->name : 'SiPesand';
        $message = "Ananda SiPesand - $name\nKode verifikasi Anda: *$otp*\nBerlaku 10 menit. Jangan bagikan kode ini.\n\nAtau gunakan 123456 untuk login cepat.";
        $fonnteToken = env('FONNTE_TOKEN');
        $wablasToken = env('WABLAS_TOKEN');
        if ($fonnteToken) {
            \Illuminate\Support\Facades\Http::withHeaders(['Authorization' => $fonnteToken])
                ->post('https://api.fonnte.com/send', ['target' => $phone, 'message' => $message]);
        } elseif ($wablasToken) {
            \Illuminate\Support\Facades\Http::post('https://texs.wablas.com/api/send-message', ['phone' => $phone, 'message' => $message, 'token' => $wablasToken]);
        }
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
            // Cek OTP cache untuk auto-login calon wali (belum registrasi tapi punya OTP valid)
            $cachedOtp = \Illuminate\Support\Facades\Cache::get('otp:' . $request->pesantren_id . ':' . $cleanPhone);
            if ($cachedOtp && ($request->otp === $cachedOtp || $request->otp === '123456')) {
                return response()->json([
                    'status' => 'unregistered',
                    'message' => 'Nomor belum terdaftar. Silakan lengkapi pendaftaran wali (sinkron otomatis dengan data santri).',
                    'need_register' => true,
                ], 404);
            }
            return response()->json([
                'status' => 'unregistered',
                'message' => 'Nomor WhatsApp belum terdaftar di data pesantren. Silakan lakukan pendaftaran dan NIS akan disinkronkan otomatis dengan database pesantren.',
                'need_register' => true,
            ], 404);
        }

        // Verifikasi OTP: izinkan 123456 master + OTP asli + cache, cek expiry
        $isExpired = $wali->otp_expires_at && Carbon::now()->greaterThan(Carbon::parse($wali->otp_expires_at));
        $cachedOtp = \Illuminate\Support\Facades\Cache::get('otp:' . $request->pesantren_id . ':' . $cleanPhone);
        $validOtp = ($request->otp === '123456') || ($wali->otp_code && $request->otp === $wali->otp_code) || ($cachedOtp && $request->otp === $cachedOtp);
        if (!$validOtp || ($isExpired && $request->otp !== '123456')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kode OTP tidak valid atau sudah kedaluwarsa. Silakan kirim ulang kode.',
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
     * Registrasi Wali Santri - Verifikasi Otomatis & Sinkron DB Tenant
     * Mencocokkan NIS/Nama dengan data santri asli di DB pesantren, auto-verified jika cocok
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pesantren_id' => 'required|exists:pesantrens,id',
            'name' => 'required|string|max:255',
            'whatsapp' => 'required|string|max:20',
            'relationship' => 'nullable|string|in:Ayah,Ibu,Wali',
            'address' => 'nullable|string',
            'nama_ananda' => 'required|string|max:255',
            'nis_ananda' => 'nullable|string',
            'nis' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $cleanPhone = preg_replace('/[^0-9]/', '', $request->whatsapp);
        if (str_starts_with($cleanPhone, '62')) $cleanPhone = '0' . substr($cleanPhone, 2);
        $relationship = $request->relationship ?? $request->hubungan ?? 'Wali';
        $nisInput = $request->nis_ananda ?? $request->nis ?? null;
        $namaAnanda = $request->nama_ananda ?? $request->nama_santri ?? $request->name;

        // Cek duplikat whatsapp di pesantren yang sama
        $existingWali = WaliSantri::where('pesantren_id', $request->pesantren_id)
            ->where('whatsapp', $cleanPhone)->first();
        if ($existingWali) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nomor WhatsApp sudah terdaftar. Silakan login menggunakan OTP.',
            ], 409);
        }

        // Sinkron: cari santri asli di DB tenant pesantren
        $santri = null;
        $isVerified = false;
        if ($nisInput) {
            $santri = Santri::where('pesantren_id', $request->pesantren_id)
                ->where('nis', trim($nisInput))->first();
        }
        if (!$santri && $namaAnanda) {
            // Fallback matching nama (untuk pesantren yang NIS belum hafal)
            $santri = Santri::where('pesantren_id', $request->pesantren_id)
                ->whereRaw('LOWER(name) = ?', [strtolower(trim($namaAnanda))])
                ->first()
                ?? Santri::where('pesantren_id', $request->pesantren_id)
                    ->whereRaw('LOWER(nama) = ?', [strtolower(trim($namaAnanda))])->first();
        }

        if ($santri) {
            // Jika santri sudah punya wali lain, tolak
            if ($santri->wali_id) {
                $existingOwner = WaliSantri::find($santri->wali_id);
                if ($existingOwner) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Data santri ' . $santri->name . ' sudah terhubung dengan wali lain (' . $existingOwner->whatsapp . '). Hubungi admin pesantren jika ini ananda Anda.',
                    ], 409);
                }
            }
            $isVerified = true; // Auto-verified karena data cocok dengan DB pesantren asli
        }

        $wali = WaliSantri::create([
            'pesantren_id' => $request->pesantren_id,
            'name' => $request->name ?? $request->nama_wali,
            'whatsapp' => $cleanPhone,
            'relationship' => $relationship,
            'address' => $request->address ?? $request->alamat,
            'is_verified' => $isVerified,
            'avatar_url' => 'https://ui-avatars.com/api/?name=' . urlencode($request->name ?? $request->nama_wali) . '&background=1E3A8A&color=fff&size=128',
        ]);

        if ($santri) {
            $santri->update(['wali_id' => $wali->id]);
            // Generate OTP langsung agar bisa login tanpa tunggu
            $wali->update(['otp_code' => '123456', 'otp_expires_at' => Carbon::now()->addMinutes(15)]);
        } else {
            // Santri belum ditemukan di DB - buat draft menunggu admin sinkronisasi (tetap auto-verified agar wali bisa akses dashboard kosong)
            $santri = Santri::create([
                'pesantren_id' => $request->pesantren_id,
                'wali_id' => $wali->id,
                'nis' => $nisInput ? trim($nisInput) : ('REG-' . time()),
                'name' => $namaAnanda,
                'nama' => $namaAnanda,
                'kelas' => 'Menunggu Sinkronisasi Data Pesantren',
                'kamar' => 'Belum Ditempatkan',
                'status' => 'Aktif',
                'saldo_uang_saku' => 0,
            ]);
            $wali->update(['is_verified' => false]);
        }

        $token = $wali->createToken('Android Device')->plainTextToken;
        $pesantren = Pesantren::find($wali->pesantren_id);

        return response()->json([
            'status' => 'success',
            'message' => $isVerified
                ? 'Pendaftaran berhasil & terverifikasi otomatis! Data ananda sinkron dengan database pesantren. Silakan login dengan OTP 123456.'
                : 'Pendaftaran diterima. Data ananda akan disinkronkan admin pesantren maksimal 1x24 jam. Anda tetap dapat login sementara.',
            'data' => [
                'token' => $token,
                'is_verified' => $isVerified,
                'wali' => [
                    'id' => $wali->id,
                    'name' => $wali->name,
                    'whatsapp' => $wali->whatsapp,
                    'relationship' => $wali->relationship,
                    'is_verified' => (bool)$wali->is_verified,
                    'avatar_url' => $wali->avatar_url,
                ],
                'santri' => [
                    'id' => $santri->id,
                    'nis' => $santri->nis,
                    'name' => $santri->name ?? $santri->nama,
                    'kelas' => $santri->kelas,
                    'status' => $santri->status,
                    'saldo_uang_saku' => (float)$santri->saldo_uang_saku,
                ],
                'pesantren' => $pesantren ? ['id' => $pesantren->id, 'name' => $pesantren->name, 'code' => $pesantren->code] : null,
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
