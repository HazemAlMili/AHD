<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkerMedia extends Model
{
    public $incrementing = false;
    public $timestamps = false;
    protected $keyType = 'string';
    protected $fillable = ['id', 'worker_id', 'url', 'storage_key', 'mime_type', 'size_bytes', 'visibility', 'is_primary', 'alt_text_ar', 'created_at'];
    protected $casts = ['is_primary' => 'boolean', 'created_at' => 'datetime'];
    public function worker(): BelongsTo { return $this->belongsTo(Worker::class); }
}
