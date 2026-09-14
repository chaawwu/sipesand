<?php

namespace App\Http\Controllers\Api\Wali;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\ChatRoom;
use App\Models\Santri;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WaliChatController extends Controller
{
    /**
     * List Chat Rooms Wali Santri
     */
    public function rooms(Request $request)
    {
        $wali = $request->user();
        $santri = Santri::where('wali_id', $wali->id)->first()
               ?? Santri::where('pesantren_id', $wali->pesantren_id)->first();

        // Ensure default room (Musyrif) exists
        $rooms = ChatRoom::where('wali_id', $wali->id)
            ->orderBy('last_message_at', 'desc')
            ->get();

        if ($rooms->isEmpty() && $santri) {
            $defaultRoom = ChatRoom::create([
                'pesantren_id' => $wali->pesantren_id,
                'wali_id' => $wali->id,
                'santri_id' => $santri->id,
                'title' => 'Musyrif ' . ($santri->musyrif_name ?? 'Ust. Rahmat Hidayat, Lc.'),
                'role_target' => 'Musyrif',
                'target_name' => $santri->musyrif_name ?? 'Ust. Rahmat Hidayat, Lc.',
                'target_avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
                'last_message' => 'Assalamu’alaikum Bapak/Ibu Wali Santri.',
                'last_message_at' => Carbon::now(),
                'unread_wali_count' => 0,
            ]);

            ChatMessage::create([
                'chat_room_id' => $defaultRoom->id,
                'sender_type' => 'pesantren',
                'sender_name' => $defaultRoom->target_name,
                'type' => 'text',
                'message' => 'Assalamu’alaikum Bapak/Ibu Wali Santri. Ini adalah saluran komunikasi resmi dengan musyrif asrama santri.',
                'is_read' => true,
            ]);

            $rooms = ChatRoom::where('wali_id', $wali->id)->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => $rooms,
        ]);
    }

    /**
     * Detail Room & Pesan-Pesan di dalamnya
     */
    public function messages(Request $request, $roomId)
    {
        $wali = $request->user();
        $room = ChatRoom::where('id', $roomId)->where('wali_id', $wali->id)->firstOrFail();

        // Mark unread messages as read
        ChatMessage::where('chat_room_id', $room->id)
            ->where('sender_type', 'pesantren')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $room->update(['unread_wali_count' => 0]);

        $messages = ChatMessage::where('chat_room_id', $room->id)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'room' => $room,
                'messages' => $messages,
            ],
        ]);
    }

    /**
     * Kirim Pesan Baru (Realtime WA-Style)
     */
    public function sendMessage(Request $request, $roomId)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'nullable|string',
            'type' => 'nullable|in:text,image,document,voice',
            'media' => 'nullable|file|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $wali = $request->user();
        $room = ChatRoom::where('id', $roomId)->where('wali_id', $wali->id)->firstOrFail();

        $type = $request->type ?? 'text';
        $mediaUrl = null;

        if ($request->hasFile('media')) {
            $path = $request->file('media')->store('chat_media', 'public');
            $mediaUrl = asset('storage/' . $path);
        }

        $chatMessage = ChatMessage::create([
            'chat_room_id' => $room->id,
            'sender_type' => 'wali',
            'sender_name' => $wali->name,
            'type' => $type,
            'message' => $request->message,
            'media_url' => $mediaUrl,
            'is_read' => false,
        ]);

        $room->update([
            'last_message' => $type === 'text' ? $request->message : "[{$type}]",
            'last_message_at' => Carbon::now(),
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $chatMessage,
        ], 201);
    }
}
