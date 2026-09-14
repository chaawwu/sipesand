<?php

namespace App\Http\Controllers\Api\Wali;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\ChatRoom;
use App\Models\Hafalan;
use App\Models\Pembayaran;
use App\Models\Pengumuman;
use App\Models\Perizinan;
use App\Models\Pesantren;
use App\Models\Santri;
use Carbon\Carbon;
use Illuminate\Http\Request;

class WaliDashboardController extends Controller
{
    public function index(Request $request)
    {
        $wali = $request->user();
        $pesantren = Pesantren::find($wali->pesantren_id);

        $santri = Santri::where('wali_id', $wali->id)->first() 
               ?? Santri::where('pesantren_id', $wali->pesantren_id)->first();

        if (!$santri) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data santri belum terhubung dengan akun wali ini.',
            ], 404);
        }

        // Tagihan aktif
        $unpaidBills = Pembayaran::where('santri_id', $santri->id)
            ->where('status', 'unpaid')
            ->orderBy('due_date', 'asc')
            ->get();
        $totalUnpaidAmount = $unpaidBills->sum('total_amount');

        // Unread chat messages
        $unreadChats = ChatRoom::where('wali_id', $wali->id)->sum('unread_wali_count');

        // Pinned Announcements
        $announcements = Pengumuman::where('pesantren_id', $wali->pesantren_id)
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Hafalan terakhir
        $latestHafalan = Hafalan::where('santri_id', $santri->id)
            ->orderBy('created_at', 'desc')
            ->first();

        // Izin aktif
        $activePerizinan = Perizinan::where('santri_id', $santri->id)
            ->whereIn('status', ['pending', 'approved'])
            ->orderBy('created_at', 'desc')
            ->first();

        // Kehadiran Hari Ini
        $todayAttendance = Absensi::where('santri_id', $santri->id)
            ->whereDate('date', Carbon::today())
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'pesantren' => [
                    'id' => $pesantren->id,
                    'name' => $pesantren->name,
                    'code' => $pesantren->code,
                    'logo_url' => $pesantren->logo_url,
                ],
                'santri' => [
                    'id' => $santri->id,
                    'nis' => $santri->nis,
                    'name' => $santri->name ?? $santri->nama,
                    'kelas' => $santri->kelas,
                    'kamar' => $santri->kamar,
                    'musyrif_name' => $santri->musyrif_name ?? 'Ust. Rahmat Hidayat, Lc.',
                    'musyrif_phone' => $santri->musyrif_phone ?? '081399887766',
                    'photo_url' => $santri->photo_url,
                    'status' => $santri->status,
                    'saldo_uang_saku' => (float)$santri->saldo_uang_saku,
                ],
                'keuangan' => [
                    'saldo_uang_saku' => (float)$santri->saldo_uang_saku,
                    'total_tagihan_aktif' => (float)$totalUnpaidAmount,
                    'jumlah_tagihan_aktif' => $unpaidBills->count(),
                    'tagihan_terbaru' => $unpaidBills->first(),
                ],
                'akademik' => [
                    'hafalan_terakhir' => $latestHafalan,
                    'status_kehadiran_hari_ini' => $todayAttendance->count() > 0 ? 'Hadir' : 'Belum Ada Data',
                ],
                'perizinan_aktif' => $activePerizinan,
                'unread_chats_count' => (int)$unreadChats,
                'pengumuman' => $announcements,
            ],
        ]);
    }
}
