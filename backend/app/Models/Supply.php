<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Supply extends Model
{
    protected $table = 'supplies';

    protected $fillable = [
        'name', 'category', 'unit', 'stock_quantity', 'reorder_level', 'description', 'is_active', 'barcode',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Supply $supply) {
            $supply->barcode ??= 'SUP-'.Str::upper(Str::random(10));
        });
    }

    public function requests()
    {
        return $this->hasMany(SupplyRequest::class);
    }

    public function isLowStock(): bool
    {
        return $this->stock_quantity <= $this->reorder_level;
    }
}
