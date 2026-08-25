<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supply;
use App\Models\SupplyRequest;
use App\Notifications\RequestStatusNotification;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Supply Request workflow. Only Faculty may request supplies.
 */
class SupplyRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = SupplyRequest::with(['supply', 'user', 'approver']);

        if (! in_array($user->role, ['admin', 'staff'], true)) {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json($query->orderByDesc('id')->paginate(20));
    }

    public function show(Request $request, SupplyRequest $supplyRequest)
    {
        $user = $request->user();
        if (! in_array($user->role, ['admin', 'staff'], true) && $supplyRequest->user_id !== $user->id) {
            abort(403, 'You may only view your own requests.');
        }

        return response()->json($supplyRequest->load(['supply', 'user', 'approver', 'transaction']));
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'faculty') {
            return response()->json(['message' => 'Only faculty accounts may request supplies.'], 403);
        }

        $data = $request->validate([
            'supply_id' => ['required', 'exists:supplies,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'purpose' => ['required', 'string'],
        ]);

        $supply = Supply::findOrFail($data['supply_id']);

        if (! $supply->is_active) {
            return response()->json(['message' => 'This supply item is not available.'], 422);
        }

        if ($data['quantity'] > $supply->stock_quantity) {
            throw ValidationException::withMessages([
                'quantity' => "Only {$supply->stock_quantity} unit(s) currently in stock.",
            ]);
        }

        $supplyRequest = SupplyRequest::create([
            'user_id' => $user->id,
            'supply_id' => $supply->id,
            'quantity' => $data['quantity'],
            'purpose' => $data['purpose'],
            'status' => 'pending',
        ]);

        return response()->json($supplyRequest->load('supply'), 201);
    }

    public function approve(Request $request, SupplyRequest $supplyRequest)
    {
        if ($supplyRequest->status !== 'pending') {
            return response()->json(['message' => 'Only pending requests can be approved.'], 422);
        }

        if ($supplyRequest->quantity > $supplyRequest->supply->stock_quantity) {
            return response()->json(['message' => 'Insufficient stock to approve this request.'], 422);
        }

        $supplyRequest->update([
            'status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        $supplyRequest->user->notify(new RequestStatusNotification(
            'supply', $supplyRequest->id, 'approved', null, $supplyRequest->supply->name
        ));

        return response()->json($supplyRequest->fresh(['supply']));
    }

    public function decline(Request $request, SupplyRequest $supplyRequest)
    {
        if ($supplyRequest->status !== 'pending') {
            return response()->json(['message' => 'Only pending requests can be declined.'], 422);
        }

        $data = $request->validate([
            'decline_reason' => ['required', 'string'],
        ]);

        $supplyRequest->update([
            'status' => 'declined',
            'decline_reason' => $data['decline_reason'],
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        $supplyRequest->user->notify(new RequestStatusNotification(
            'supply', $supplyRequest->id, 'declined', $data['decline_reason'], $supplyRequest->supply->name
        ));

        return response()->json($supplyRequest->fresh());
    }

    public function cancel(Request $request, SupplyRequest $supplyRequest)
    {
        $user = $request->user();
        if ($supplyRequest->user_id !== $user->id) {
            return response()->json(['message' => 'You may only cancel your own requests.'], 403);
        }
        if ($supplyRequest->status !== 'pending') {
            return response()->json(['message' => 'This request can no longer be cancelled.'], 422);
        }

        $supplyRequest->update(['status' => 'cancelled']);

        return response()->json($supplyRequest->fresh());
    }
}
