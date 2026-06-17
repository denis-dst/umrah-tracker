<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Itinerary extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'group_id',
        'day_number',
        'date',
        'time',
        'activity_title',
        'description',
        'location',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function group()
    {
        return $this->belongsTo(Group::class);
    }
}
