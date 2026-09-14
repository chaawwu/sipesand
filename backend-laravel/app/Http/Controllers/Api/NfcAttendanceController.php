<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Santri;
use App\Models\NfcAttendance;
use Illuminate\Http\Request;

class NfcAttendanceController extends Controller
{
    /**
     * POST /api/nfc/scan
     * Menerima UID kartu KTSD dari Android / reader NFC
     */
    public function scan(Request $request)
    {
        $validated = $request->validate([
            'nfc_uid' => 'required|string',
            'action_type' => 'nullable|string|in:MASUK,PULANG,AUTO,CEK_SALDO',
            'tenant' => 'nullable|string',
            'device_info' => 'nullable|string',
        ]);

        $rawUid = strtoupper(trim($validated['nfc_uid']));
        $tenant = $validated['tenant'] ?? $request->header('X-Tenant-Subdomain', 'darulrahman');

        // Cari santri berdasarkan UID kartu KTSD dan tenant
        $santri = Santri::where('nfc_uid', $rawUid)
            ->where(function ($q) use ($tenant) {
                $q->where('tenant_subdomain', $tenant)
                  ->orWhereNull('tenant_subdomain');
            })->first();

        if (!$santri) {
            return response()->json([
                'success' => false,
                'message' => "Kartu KTSD ($rawUid) belum terdaftar pada sistem pondok.",
                'nfc_uid' => $rawUid,
            ], 404);
        }

        // Tentukan jenis aksi (Masuk atau Pulang secara otomatis jika AUTO)
        $action = $validated['action_type'] ?? 'AUTO';
        if ($action === 'AUTO' || empty($action)) {
            $action = ($santri->status_kehadiran === 'MASUK') ? 'PULANG' : 'MASUK';
        }

        if ($action !== 'CEK_SALDO') {
            $santri->status_kehadiran = $action;
            $santri->save();

            // Catat log kehadiran
            NfcAttendance::create([
                'tenant_subdomain' => $tenant,
                'santri_id' => $santri->id,
                'nfc_uid' => $rawUid,
                'action_type' => $action,
                'device_info' => $validated['device_info'] ?? $request->userAgent(),
                'scanned_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => "Absensi {$action} berhasil untuk {$santri->nama}",
            'data' => [
                'santri_id' => $santri->id,
                'nis' => $santri->nis,
                'nama' => $santri->nama,
                'kelas' => $santri->kelas,
                'kamar' => $santri->kamar,
                'status_kehadiran' => $santri->status_kehadiran,
                'saldo_saku' => (float) $santri->saldo_saku,
                'action' => $action,
                'scanned_at' => now()->toISOString(),
            ],
        ]);
    }

    /**
     * GET /api/nfc/history
     */
    public function history(Request $request)
    {
        $tenant = $request->query('tenant', $request->header('X-Tenant-Subdomain', 'darulrahman'));

        $logs = NfcAttendance::with('santri')
            ->where('tenant_subdomain', $tenant)
            ->latest('scanned_at')
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }
}
