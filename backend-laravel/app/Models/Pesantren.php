<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pesantren extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function walis()
    {
        return $this->hasMany(WaliSantri::class);
    }

    public function santris()
    {
        return $this->hasMany(Santri::class);
    }

    public function pembayarans()
    {
        return $this->hasMany(Pembayaran::class);
    }
}
