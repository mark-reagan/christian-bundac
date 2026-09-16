<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConcernResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'description' => $this->description,
            'severity' => $this->severity,
            'status' => $this->status,
            'admin_remarks' => $this->admin_remarks,
            'reviewed_at' => $this->reviewed_at,
            'equipment' => new EquipmentResource($this->whenLoaded('equipment')),
            'reporter' => new UserResource($this->whenLoaded('reporter')),
            'reviewer' => new UserResource($this->whenLoaded('reviewer')),
            'transaction' => new EquipmentTransactionResource($this->whenLoaded('transaction')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
