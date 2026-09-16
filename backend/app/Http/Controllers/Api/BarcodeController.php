<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ScanQrCodeRequest;
use App\Http\Resources\EquipmentRequestResource;
use App\Http\Resources\EquipmentResource;
use App\Http\Resources\EquipmentTransactionResource;
use App\Models\Equipment;
use App\Models\EquipmentRequest;
use App\Models\EquipmentTransaction;
use Illuminate\Http\Request;

class BarcodeController extends Controller
{
    public function show(Equipment $equipment)
    {
        return response()->json([
            'equipment_id' => $equipment->id,
            'asset_code' => $equipment->asset_code,
            'barcode' => $equipment->barcode,
        ]);
    }

    public function scan(ScanQrCodeRequest $request)
    {
        $equipment = Equipment::where('barcode', $request->validated('code'))->first();
        if (! $equipment) {
            return response()->json(['message' => 'No equipment found for this barcode.'], 404);
        }

        $awaitingRelease = EquipmentRequest::where('equipment_id', $equipment->id)
            ->where('status', 'approved')->orderBy('start_date')->first();
        $awaitingReturn = EquipmentTransaction::whereHas('equipmentRequest', function ($query) use ($equipment) {
            $query->where('equipment_id', $equipment->id);
        })->where('status', 'released')->first();

        return response()->json([
            'equipment' => new EquipmentResource($equipment),
            'awaiting_release_request' => $awaitingRelease ? new EquipmentRequestResource($awaitingRelease->load('user')) : null,
            'awaiting_return_transaction' => $awaitingReturn ? new EquipmentTransactionResource($awaitingReturn->load('equipmentRequest.user')) : null,
        ]);
    }
}
