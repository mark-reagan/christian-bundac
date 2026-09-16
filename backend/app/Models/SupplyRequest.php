<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SupplyRequest extends Model
{
    protected $fillable = [
        'tracking_token', 'user_id', 'supply_id', 'quantity', 'purpose', 'status',
        'decline_reason', 'approved_by', 'approved_at',
    ];

    protected static function booted(): void
    {
        static::creating(function (SupplyRequest $request) {
            $request->tracking_token ??= (string) Str::uuid();
        });
    }

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function supply()
    {
        return $this->belongsTo(Supply::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function transaction()
    {
        return $this->hasOne(SupplyTransaction::class);
    }
}
