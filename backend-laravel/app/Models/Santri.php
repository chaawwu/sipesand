<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Santri extends Model
{
    protected $fillable = [
        'tenant_subdomain',
        'nis',
        'nama',
        'kelas',
        'kamar',
        'nfc_uid',
        'status_kehadiran',
        'saldo_saku',
        'wali_nama',
        'wali_phone',
    ];

    public function attendances()
    {
        return $this->hasMany(NfcAttendance::class);
    }

    public function payments()
    {
        return $this->hasMany(KaserapayPayment::class);
    }
}
