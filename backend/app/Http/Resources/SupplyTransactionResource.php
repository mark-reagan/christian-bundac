<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupplyTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $supplyRequest = $this->relationLoaded('supplyRequest') ? $this->supplyRequest : null;

        return [
            'id' => $this->id,
            'tracking_token' => $supplyRequest?->tracking_token,
            'tracking_url' => $supplyRequest?->tracking_token
                ? rtrim(config('app.frontend_url'), '/').'/track/'.$supplyRequest->tracking_token
                : null,
            'qr_url' => $supplyRequest?->tracking_token
                ? rtrim(config('app.url'), '/').'/api/v1/public/requests/'.$supplyRequest->tracking_token.'/qr'
                : null,
            'quantity_released' => $this->quantity_released,
            'released_at' => $this->released_at,
            'released_by' => new UserResource($this->whenLoaded('releasedBy')),
            'supply_request' => new SupplyRequestResource($this->whenLoaded('supplyRequest')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
