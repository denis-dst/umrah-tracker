<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmergencyAlert extends Model
{
    protected $fillable = [
        'user_id',
        'group_id',
        'latitude',
        'longitude',
        'worship_summary',
        'is_resolved',
    ];

    protected $casts = [
        'worship_summary' => 'array',
        'is_resolved' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function group()
    {
        return $this->belongsTo(Group::class);
    }
}
