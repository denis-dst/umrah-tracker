<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorshipSession extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'type',
        'start_lat',
        'start_lng',
        'current_count',
        'status',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'start_lat' => 'decimal:8',
        'start_lng' => 'decimal:8',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
