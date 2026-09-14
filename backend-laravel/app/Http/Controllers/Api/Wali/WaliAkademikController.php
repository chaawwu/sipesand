<?php

namespace App\Http\Controllers\Api\Wali;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\Hafalan;
use App\Models\Nilai;
use App\Models\Santri;
use Carbon\Carbon;
use Illuminate\Http\Request;

class WaliAkademikController extends Controller
{
    /**
     * Rapor & Nilai Pelajaran
     */
    public function nilai(Request $request)
    {
        $wali = $request->user();
        $santri = Santri::where('wali_id', $wali->id)->first()
               ?? Santri::where('pesantren_id', $wali->pesantren_id)->first();

        $nilais = Nilai::where('santri_id', $santri->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $averageScore = $nilais->avg('score');

        return response()->json([
            'status' => 'success',
            'data' => [
                'santri' => [
                    'id' => $santri->id,
                    'name' => $santri->name ?? $santri->nama,
                    'nis' => $santri->nis,
                    'kelas' => $santri->kelas,
                ],
                'rata_rata' => round($averageScore, 2),
                'nilai_list' => $nilais,
            ],
        ]);
    }

    /**
     * Muhafadzoh & Tahfidz Quran
     */
    public function tahfidz(Request $request)
    {
        $wali = $request->user();
        $santri = Santri::where('wali_id', $wali->id)->first()
               ?? Santri::where('pesantren_id', $wali->pesantren_id)->first();

        $hafalans = Hafalan::where('santri_id', $santri->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'santri' => [
                    'id' => $santri->id,
                    'name' => $santri->name ?? $santri->nama,
                    'nis' => $santri->nis,
                ],
                'total_setoran' => $hafalans->count(),
                'setoran_list' => $hafalans,
            ],
        ]);
    }

    /**
     * Absensi Kehadiran & Sholat Berjamaah
     */
    public function absensi(Request $request)
    {
        $wali = $request->user();
        $santri = Santri::where('wali_id', $wali->id)->first()
               ?? Santri::where('pesantren_id', $wali->pesantren_id)->first();

        $month = $request->query('month', Carbon::now()->format('Y-m'));

        $absensis = Absensi::where('santri_id', $santri->id)
            ->where('date', 'like', "{$month}%")
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        $totalHadir = $absensis->where('status', 'Hadir')->count();
        $totalSakit = $absensis->where('status', 'Sakit')->count();
        $totalIzin = $absensis->where('status', 'Izin')->count();
        $totalAlfa = $absensis->where('status', 'Alfa')->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'santri' => [
                    'id' => $santri->id,
                    'name' => $santri->name ?? $santri->nama,
                ],
                'summary' => [
                    'hadir' => $totalHadir,
                    'sakit' => $totalSakit,
                    'izin' => $totalIzin,
                    'alfa' => $totalAlfa,
                ],
                'absensi_list' => $absensis,
            ],
        ]);
    }
}
