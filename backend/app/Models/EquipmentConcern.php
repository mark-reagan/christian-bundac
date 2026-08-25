<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EquipmentConcern extends Model
{
    protected $fillable = [
        'equipment_id', 'equipment_transaction_id', 'reported_by', 'description',
        'severity', 'status', 'admin_remarks', 'reviewed_by', 'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function equipment()
    {
        return $this->belongsTo(Equipment::class);
    }

    public function transaction()
    {
        return $this->belongsTo(EquipmentTransaction::class, 'equipment_transaction_id');
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
