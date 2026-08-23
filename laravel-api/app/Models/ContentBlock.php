<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContentBlock extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id', 'key', 'content_en', 'content_ar', 'is_active'];
    protected $casts = ['content_en' => 'array', 'content_ar' => 'array', 'is_active' => 'boolean'];
}
