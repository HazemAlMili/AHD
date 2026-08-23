<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Worker extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id', 'public_code', 'display_name', 'slug', 'nationality_id', 'age', 'current_city', 'years_experience', 'saudi_experience_years', 'public_summary_en', 'public_summary_ar', 'languages', 'internal_notes', 'availability_status', 'publication_status', 'is_featured', 'sort_order', 'published_at', 'archived_at'];
    protected $casts = ['languages' => 'array', 'is_featured' => 'boolean', 'published_at' => 'datetime', 'archived_at' => 'datetime'];

    public function nationality(): BelongsTo { return $this->belongsTo(Nationality::class); }
    public function skills(): BelongsToMany { return $this->belongsToMany(Skill::class, 'worker_skills'); }
    public function media(): HasMany { return $this->hasMany(WorkerMedia::class); }
}
