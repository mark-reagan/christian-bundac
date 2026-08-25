<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    protected $table = 'equipment';

    protected $fillable = [
        'name', 'asset_code', 'category', 'description', 'total_quantity',
        'available_quantity', 'condition', 'status', 'qr_code', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

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
        if ($this->available_quantity <= 0) {
            $this->status = 'unavailable';
        } elseif ($this->available_quantity < $this->total_quantity) {
            $this->status = 'partially_available';
        } else {
            $this->status = 'available';
        }
        $this->save();
    }
}
