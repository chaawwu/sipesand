<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WaliNotification extends Model
{
    use HasFactory;

    protected $table = 'wali_notifications';
    protected $guarded = ['id'];
}
