<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'department', 'contact_number', 'is_active',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isStaff(): bool
    {
        return $this->role === 'staff';
    }

    public function isFaculty(): bool
    {
        return $this->role === 'faculty';
    }

    public function isOutsider(): bool
    {
        return $this->role === 'outsider';
    }

    public function equipmentRequests()
    {
        return $this->hasMany(EquipmentRequest::class);
    }

    public function supplyRequests()
    {
        return $this->hasMany(SupplyRequest::class);
    }
}
