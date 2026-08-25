<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use App\Models\EquipmentConcern;
use App\Notifications\ConcernNotification;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Damage & Concern Management.
 * Faculty, Outsiders and Staff may report a concern. Admin reviews and
 * updates the equipment's official condition.
 */
class ConcernController extends Controller
{
    public function index(Request $request)
    {
        $query = EquipmentConcern::with(['equipment', 'reporter', 'reviewer']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json($query->orderByDesc('id')->paginate(20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'equipment_id' => ['required', 'exists:equipment,id'],
            'equipment_transaction_id' => [
                'nullable',
                Rule::exists('equipment_transactions', 'id')
                    ->where(fn ($query) => $query->where('equipment_id', $request->input('equipment_id'))),
            ],
            'description' => ['required', 'string'],
            'severity' => ['required', 'in:minor,major,critical'],
        ]);

        $data['reported_by'] = $request->user()->id;

        $concern = EquipmentConcern::create($data);

        return response()->json($concern->load('equipment'), 201);
    }

    public function show(EquipmentConcern $concern)
    {
        return response()->json($concern->load(['equipment', 'reporter', 'reviewer', 'transaction']));
    }

    /**
     * Admin-only: review the concern and optionally update the equipment condition.
     */
    public function review(Request $request, EquipmentConcern $concern)
    {
        $data = $request->validate([
            'status' => ['required', 'in:reviewed,resolved'],
            'admin_remarks' => ['nullable', 'string'],
            'update_condition' => ['nullable', 'in:good,fair,damaged,under_repair,lost'],
        ]);

        $concern->update([
            'status' => $data['status'],
            'admin_remarks' => $data['admin_remarks'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        if (! empty($data['update_condition'])) {
            $equipment = $concern->equipment;
            $equipment->condition = $data['update_condition'];
            $equipment->save();
        }

        $concern->reporter->notify(new ConcernNotification(
            $concern->id, $concern->equipment->name, $data['status']
        ));

        return response()->json($concern->fresh(['equipment']));
    }
}
