<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Prayer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category',
        'title',
        'text_arabic',
        'text_translation',
        'audio_url',
    ];
}
