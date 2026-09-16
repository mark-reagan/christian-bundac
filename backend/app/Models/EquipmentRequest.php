<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class EquipmentRequest extends Model
{
    protected $fillable = [
        'tracking_token', 'user_id', 'equipment_id', 'quantity', 'purpose', 'start_date', 'end_date',
        'status', 'decline_reason', 'approved_by', 'approved_at',
    ];

    protected static function booted(): void
    {
        static::creating(function (EquipmentRequest $request) {
            $request->tracking_token ??= (string) Str::uuid();
        });
    }

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function equipment()
    {
        return $this->belongsTo(Equipment::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function transaction()
    {
        return $this->hasOne(EquipmentTransaction::class);
    }
}
