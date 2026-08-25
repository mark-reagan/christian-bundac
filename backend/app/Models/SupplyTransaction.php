<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupplyTransaction extends Model
{
    protected $fillable = ['supply_request_id', 'released_by', 'quantity_released', 'released_at'];

    protected $casts = [
        'released_at' => 'datetime',
    ];

    public function supplyRequest()
    {
        return $this->belongsTo(SupplyRequest::class);
    }

    public function releasedBy()
    {
        return $this->belongsTo(User::class, 'released_by');
    }
}
