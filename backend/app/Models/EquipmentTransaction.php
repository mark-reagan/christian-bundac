<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EquipmentTransaction extends Model
{
    protected $fillable = [
        'equipment_request_id', 'released_by', 'released_at', 'condition_on_release',
        'received_by', 'returned_at', 'condition_on_return', 'remarks', 'status',
    ];

    protected $casts = [
        'released_at' => 'datetime',
        'returned_at' => 'datetime',
    ];

    public function equipmentRequest()
    {
        return $this->belongsTo(EquipmentRequest::class);
    }

    public function releasedBy()
    {
        return $this->belongsTo(User::class, 'released_by');
    }

    public function receivedBy()
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function concerns()
    {
        return $this->hasMany(EquipmentConcern::class);
    }
}
