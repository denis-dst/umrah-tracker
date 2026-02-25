<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorshipLog extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'activity_type',
        'value',
        'notes',
        'log_datetime',
    ];

    protected $casts = [
        'log_datetime' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
