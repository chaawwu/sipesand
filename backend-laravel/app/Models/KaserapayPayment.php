<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KaserapayPayment extends Model
{
    protected $fillable = [
        'tenant_subdomain',
        'santri_id',
        'bill_id',
        'external_id',
        'transaction_id',
        'amount',
        'title',
        'payment_method',
        'status',
        'checkout_url',
        'qr_string',
        'paid_at',
        'raw_response',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'raw_response' => 'array',
    ];

    public function santri()
    {
        return $this->belongsTo(Santri::class);
    }
}
