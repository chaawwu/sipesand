<?php

namespace App\Http\Controllers\Api\Wali;

use App\Http\Controllers\Controller;
use App\Models\WaliNotification;
use Illuminate\Http\Request;

class WaliNotificationController extends Controller
{
    public function index(Request $request)
    {
        $wali = $request->user();

        $notifications = WaliNotification::where('wali_id', $wali->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $notifications,
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $wali = $request->user();
        $notif = WaliNotification::where('id', $id)->where('wali_id', $wali->id)->firstOrFail();
        $notif->update(['is_read' => true]);

        return response()->json([
            'status' => 'success',
            'message' => 'Notifikasi ditandai sebagai dibaca.',
        ]);
    }
}
