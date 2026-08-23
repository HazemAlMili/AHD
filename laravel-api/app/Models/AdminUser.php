<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdminUser extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id', 'email', 'password_hash', 'display_name', 'role', 'is_active'];
    protected $hidden = ['password_hash'];
    protected $casts = ['is_active' => 'boolean'];
    public function sessions(): HasMany { return $this->hasMany(AdminSession::class, 'admin_user_id'); }
}
