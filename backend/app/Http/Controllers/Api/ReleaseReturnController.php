<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReleaseEquipmentRequest;
use App\Http\Requests\ReturnEquipmentRequest;
use App\Http\Resources\EquipmentTransactionResource;
use App\Http\Resources\SupplyTransactionResource;
use App\Models\EquipmentRequest;
use App\Models\EquipmentTransaction;
use App\Models\SupplyRequest;
use App\Models\SupplyTransaction;
use App\Notifications\ReleaseReturnNotification;
use Illuminate\Http\Request;

/**
 * Staff-only: physical release and return of approved equipment/supply requests.
 * Staff cannot approve/decline requests -- they only execute admin-approved ones.
 */
class ReleaseReturnController extends Controller
{
    public function releaseEquipment(ReleaseEquipmentRequest $request, EquipmentRequest $equipmentRequest)
    {
        if ($equipmentRequest->status !== 'approved') {
            return response()->json(['message' => 'Only approved requests can be released.'], 422);
        }

        $data = $request->validated();

        $transaction = EquipmentTransaction::create([
            'equipment_request_id' => $equipmentRequest->id,
            'released_by' => $request->user()->id,
            'released_at' => now(),
            'condition_on_release' => $data['condition_on_release'] ?? $equipmentRequest->equipment->condition,
            'status' => 'released',
        ]);

        $equipmentRequest->update(['status' => 'released']);

        $equipmentRequest->user->notify(new ReleaseReturnNotification(
            'equipment', $equipmentRequest->id, 'released', $equipmentRequest->equipment->name
        ));

        return (new EquipmentTransactionResource($transaction->load('equipmentRequest.equipment')))->response()->setStatusCode(201);
    }

    public function returnEquipment(ReturnEquipmentRequest $request, EquipmentTransaction $equipmentTransaction)
    {
        if ($equipmentTransaction->status !== 'released') {
            return response()->json(['message' => 'This transaction has already been returned.'], 422);
        }

        $data = $request->validated();

        $equipmentRequest = $equipmentTransaction->equipmentRequest;
        $equipment = $equipmentRequest->equipment;

        $equipmentTransaction->update([
            'received_by' => $request->user()->id,
            'returned_at' => now(),
            'condition_on_return' => $data['condition_on_return'],
            'remarks' => $data['remarks'] ?? null,
            'status' => 'returned',
        ]);

        $equipmentRequest->update(['status' => 'completed']);

        // Returned equipment is requestable again unless it is damaged.
        if ($data['condition_on_return'] !== 'damaged') {
            $equipment->increment('available_quantity', $equipmentRequest->quantity);
        }

        $equipment->condition = $data['condition_on_return'];
        $equipment->save();
        $equipment->refreshStatus();

        $equipmentRequest->user->notify(new ReleaseReturnNotification(
            'equipment', $equipmentRequest->id, 'returned', $equipment->name
        ));

        return new EquipmentTransactionResource($equipmentTransaction->fresh(['equipmentRequest.equipment']));
    }

    public function releaseSupply(Request $request, SupplyRequest $supplyRequest)
    {
        if ($supplyRequest->status !== 'approved') {
            return response()->json(['message' => 'Only approved requests can be released.'], 422);
        }

        $supply = $supplyRequest->supply;
        if ($supplyRequest->quantity > $supply->stock_quantity) {
            return response()->json(['message' => 'Insufficient stock to release this request.'], 422);
        }

        $transaction = SupplyTransaction::create([
            'supply_request_id' => $supplyRequest->id,
            'released_by' => $request->user()->id,
            'quantity_released' => $supplyRequest->quantity,
            'released_at' => now(),
        ]);

        // Automatic supply stock deduction.
        $supply->decrement('stock_quantity', $supplyRequest->quantity);

        $supplyRequest->update(['status' => 'completed']);

        $supplyRequest->user->notify(new ReleaseReturnNotification(
            'supply', $supplyRequest->id, 'released', $supply->name
        ));

        return (new SupplyTransactionResource($transaction->load('supplyRequest.supply')))->response()->setStatusCode(201);
    }
}
