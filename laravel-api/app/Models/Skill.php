<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Skill extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id', 'name_en', 'name_ar', 'slug', 'is_active', 'sort_order'];
    protected $casts = ['is_active' => 'boolean'];
    public function workers(): BelongsToMany { return $this->belongsToMany(Worker::class, 'worker_skills'); }
}
