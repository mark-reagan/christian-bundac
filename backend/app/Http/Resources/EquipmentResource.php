<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EquipmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'asset_code' => $this->asset_code,
            'barcode' => $this->barcode,
            'category' => $this->category,
            'description' => $this->description,
            'total_quantity' => $this->total_quantity,
            'available_quantity' => $this->available_quantity,
            'condition' => $this->condition,
            'status' => $this->status,
            'is_active' => $this->is_active,
            'requests_count' => $this->when(isset($this->requests_count), $this->requests_count),
            'concerns_count' => $this->when(isset($this->concerns_count), $this->concerns_count),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
