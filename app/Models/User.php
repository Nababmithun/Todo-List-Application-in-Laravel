<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name','email','password',
        'mobile','gender','avatar_path','is_admin',
    ];

    protected $hidden = [
        'password','remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_admin' => 'boolean',
    ];

    protected $appends = ['avatar_url'];

    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar_path ? Storage::url($this->avatar_path) : null;
    }
}
