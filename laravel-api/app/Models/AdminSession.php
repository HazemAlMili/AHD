<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminSession extends Model
{
    public $incrementing = false;
    public $timestamps = false;
    protected $primaryKey = 'token_hash';
    protected $keyType = 'string';
    protected $fillable = ['token_hash', 'admin_user_id', 'expires_at', 'created_at'];
    protected $casts = ['expires_at' => 'datetime', 'created_at' => 'datetime'];
    public function adminUser(): BelongsTo { return $this->belongsTo(AdminUser::class, 'admin_user_id'); }
}
