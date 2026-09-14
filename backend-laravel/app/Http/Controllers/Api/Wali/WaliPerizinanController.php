<?php

namespace App\Http\Controllers\Api\Wali;

use App\Http\Controllers\Controller;
use App\Models\Perizinan;
use App\Models\Santri;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class WaliPerizinanController extends Controller
{
    /**
     * Riwayat Perizinan Pulang Santri
     */
    public function index(Request $request)
    {
        $wali = $request->user();
        $santri = Santri::where('wali_id', $wali->id)->first()
               ?? Santri::where('pesantren_id', $wali->pesantren_id)->first();

        $perizinans = Perizinan::where('santri_id', $santri->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $perizinans,
        ]);
    }

    /**
     * Ajukan Permohonan Izin Pulang Santri
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'attachment' => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
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

        $attachmentUrl = null;
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('perizinan', 'public');
            $attachmentUrl = asset('storage/' . $path);
        }

        $qrCodeToken = 'QR-IZIN-' . date('Ym') . '-' . strtoupper(Str::random(6));

        $perizinan = Perizinan::create([
            'pesantren_id' => $wali->pesantren_id,
            'santri_id' => $santri->id,
            'wali_id' => $wali->id,
            'reason' => $request->reason,
            'description' => $request->description,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'attachment_url' => $attachmentUrl,
            'status' => 'pending',
            'qr_code_token' => $qrCodeToken,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Permohonan izin kepulangan berhasil diajukan dan sedang ditinjau pengurus.',
            'data' => $perizinan,
        ], 201);
    }
}
