<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Equipment extends Model
{
    protected $table = 'equipment';

    protected $fillable = [
        'name', 'asset_code', 'category', 'description', 'total_quantity',
        'available_quantity', 'condition', 'status', 'qr_code', 'barcode', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Equipment $equipment) {
            $equipment->barcode ??= 'EQ-'.Str::upper(Str::random(10));
        });
    }

    public function requests()
    {
        return $this->hasMany(EquipmentRequest::class);
    }

    public function concerns()
    {
        return $this->hasMany(EquipmentConcern::class);
    }

    public function refreshStatus(): void
    {
        if (! in_array($this->condition, ['good', 'fair', 'damaged'], true) || $this->available_quantity <= 0) {
            $this->status = 'unavailable';
        } elseif ($this->available_quantity < $this->total_quantity) {
            $this->status = 'partially_available';
        } else {
            $this->status = 'available';
        }
        $this->save();
    }
}
