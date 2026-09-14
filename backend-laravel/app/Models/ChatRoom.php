<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatRoom extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function wali()
    {
        return $this->belongsTo(WaliSantri::class, 'wali_id');
    }

    public function santri()
    {
        return $this->belongsTo(Santri::class);
    }

    public function messages()
    {
        return $this->hasMany(ChatMessage::class, 'chat_room_id')->orderBy('created_at', 'asc');
    }
}
