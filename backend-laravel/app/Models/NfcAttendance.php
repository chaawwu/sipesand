<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NfcAttendance extends Model
{
    protected $fillable = [
        'tenant_subdomain',
        'santri_id',
        'nfc_uid',
        'action_type',
        'device_info',
        'scanned_at',
        'extra_metadata',
    ];

    protected $casts = [
        'scanned_at' => 'datetime',
        'extra_metadata' => 'array',
    ];

    public function santri()
    {
        return $this->belongsTo(Santri::class);
    }
}
