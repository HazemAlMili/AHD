<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    public $incrementing = false;
    public $timestamps = false;
    protected $keyType = 'string';
    protected $fillable = ['id', 'actor_admin_id', 'action', 'entity_type', 'entity_id', 'before_json', 'after_json', 'request_id', 'ip_address', 'user_agent', 'created_at'];
    protected $casts = ['before_json' => 'array', 'after_json' => 'array', 'created_at' => 'datetime'];
    public function actor(): BelongsTo { return $this->belongsTo(AdminUser::class, 'actor_admin_id'); }
}
