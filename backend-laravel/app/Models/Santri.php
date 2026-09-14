<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Santri extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function pesantren()
    {
        return $this->belongsTo(Pesantren::class);
    }

    public function wali()
    {
        return $this->belongsTo(WaliSantri::class, 'wali_id');
    }

    public function pembayarans()
    {
        return $this->hasMany(Pembayaran::class);
    }

    public function uangSakus()
    {
        return $this->hasMany(UangSaku::class);
    }

    public function nilais()
    {
        return $this->hasMany(Nilai::class);
    }

    public function hafalans()
    {
        return $this->hasMany(Hafalan::class);
    }

    public function absensis()
    {
        return $this->hasMany(Absensi::class);
    }

    public function perizinans()
    {
        return $this->hasMany(Perizinan::class);
    }
}
