<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupplyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'barcode' => $this->barcode,
            'name' => $this->name,
            'category' => $this->category,
            'unit' => $this->unit,
            'stock_quantity' => $this->stock_quantity,
            'reorder_level' => $this->reorder_level,
            'description' => $this->description,
            'is_active' => $this->is_active,
            'requests_count' => $this->when(isset($this->requests_count), $this->requests_count),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
