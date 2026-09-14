<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class WaliSantri extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $table = 'wali_santris';

    protected $guarded = ['id'];

    protected $hidden = [
        'otp_code',
        'otp_expires_at',
    ];

    public function pesantren()
    {
        return $this->belongsTo(Pesantren::class);
    }

    public function santris()
    {
        return $this->hasMany(Santri::class, 'wali_id');
    }

    public function perizinans()
    {
        return $this->hasMany(Perizinan::class, 'wali_id');
    }

    public function chatRooms()
    {
        return $this->hasMany(ChatRoom::class, 'wali_id');
    }

    public function notifications()
    {
        return $this->hasMany(WaliNotification::class, 'wali_id');
    }
}
