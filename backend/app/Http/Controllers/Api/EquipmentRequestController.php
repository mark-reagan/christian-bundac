<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use App\Models\EquipmentRequest;
use App\Notifications\RequestStatusNotification;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Equipment Request & Reservation workflow.
 * Faculty and Outsiders/LGU may request+reserve equipment.
 * Admin approves/declines. Staff performs the physical release/return (see ReleaseReturnController).
 */
class EquipmentRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = EquipmentRequest::with(['equipment', 'user', 'approver']);

        // Faculty/outsiders only see their own requests. Admin/staff see all.
        if (in_array($user->role, ['faculty', 'outsider'], true)) {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json($query->orderByDesc('id')->paginate(20));
    }

    public function show(Request $request, EquipmentRequest $equipmentRequest)
    {
        $this->authorizeOwnerOrStaffAdmin($request, $equipmentRequest);

        return response()->json($equipmentRequest->load(['equipment', 'user', 'approver', 'transaction']));
    }

    public function store(Request $request)
    {
        $user = $request->user();

        // Only faculty and outsiders may request equipment.
        if (! in_array($user->role, ['faculty', 'outsider'], true)) {
            return response()->json(['message' => 'Only faculty and outsider/LGU accounts may request equipment.'], 403);
        }

        $data = $request->validate([
            'equipment_id' => ['required', 'exists:equipment,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'purpose' => ['required', 'string'],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ]);

        $equipment = Equipment::findOrFail($data['equipment_id']);

        if (! $equipment->is_active) {
            return response()->json(['message' => 'This equipment is not available for request.'], 422);
        }

        if ($data['quantity'] > $equipment->available_quantity) {
            throw ValidationException::withMessages([
                'quantity' => "Only {$equipment->available_quantity} unit(s) currently available.",
            ]);
        }

        $equipmentRequest = EquipmentRequest::create([
            'user_id' => $user->id,
            'equipment_id' => $equipment->id,
            'quantity' => $data['quantity'],
            'purpose' => $data['purpose'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'status' => 'pending',
        ]);

        return response()->json($equipmentRequest->load('equipment'), 201);
    }

    public function approve(Request $request, EquipmentRequest $equipmentRequest)
    {
        if ($equipmentRequest->status !== 'pending') {
            return response()->json(['message' => 'Only pending requests can be approved.'], 422);
        }

        $equipment = $equipmentRequest->equipment;
        if ($equipmentRequest->quantity > $equipment->available_quantity) {
            return response()->json(['message' => 'Insufficient available quantity to approve this request.'], 422);
        }

        $equipmentRequest->update([
            'status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        // Reserve the stock so it can't be double-booked while awaiting release.
        $equipment->decrement('available_quantity', $equipmentRequest->quantity);
        $equipment->refreshStatus();

        $equipmentRequest->user->notify(new RequestStatusNotification(
            'equipment', $equipmentRequest->id, 'approved', null, $equipment->name
        ));

        return response()->json($equipmentRequest->fresh(['equipment']));
    }

    public function decline(Request $request, EquipmentRequest $equipmentRequest)
    {
        if ($equipmentRequest->status !== 'pending') {
            return response()->json(['message' => 'Only pending requests can be declined.'], 422);
        }

        $data = $request->validate([
            'decline_reason' => ['required', 'string'],
        ]);

        $equipmentRequest->update([
            'status' => 'declined',
            'decline_reason' => $data['decline_reason'],
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        $equipmentRequest->user->notify(new RequestStatusNotification(
            'equipment', $equipmentRequest->id, 'declined', $data['decline_reason'], $equipmentRequest->equipment->name
        ));

        return response()->json($equipmentRequest->fresh());
    }

    public function cancel(Request $request, EquipmentRequest $equipmentRequest)
    {
        $user = $request->user();
        if ($equipmentRequest->user_id !== $user->id) {
            return response()->json(['message' => 'You may only cancel your own requests.'], 403);
        }
        if (! in_array($equipmentRequest->status, ['pending', 'approved'], true)) {
            return response()->json(['message' => 'This request can no longer be cancelled.'], 422);
        }

        if ($equipmentRequest->status === 'approved') {
            // release the reserved stock back
            $equipmentRequest->equipment->increment('available_quantity', $equipmentRequest->quantity);
            $equipmentRequest->equipment->refreshStatus();
        }

        $equipmentRequest->update(['status' => 'cancelled']);

        return response()->json($equipmentRequest->fresh());
    }

    private function authorizeOwnerOrStaffAdmin(Request $request, EquipmentRequest $equipmentRequest): void
    {
        $user = $request->user();
        if (in_array($user->role, ['faculty', 'outsider'], true) && $equipmentRequest->user_id !== $user->id) {
            abort(403, 'You may only view your own requests.');
        }
    }
}
