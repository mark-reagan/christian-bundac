<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewConcernRequest;
use App\Http\Requests\StoreConcernRequest;
use App\Http\Resources\ConcernResource;
use App\Models\Equipment;
use App\Models\EquipmentConcern;
use App\Models\User;
use App\Notifications\ConcernNotification;
use Illuminate\Http\Request;

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

        return ConcernResource::collection($query->orderByDesc('id')->paginate(20));
    }

    public function store(StoreConcernRequest $request)
    {
        $data = $request->validated();

        $data['reported_by'] = $request->user()->id;

        $concern = EquipmentConcern::create($data);
        $equipment = $concern->equipment;

        User::query()
            ->where('role', 'admin')
            ->where('is_active', true)
            ->get()
            ->each(fn (User $admin) => $admin->notify(new ConcernNotification(
                $concern->id, $equipment->name, 'reported'
            )));

        return (new ConcernResource($concern->load('equipment')))->response()->setStatusCode(201);
    }

    public function show(EquipmentConcern $concern)
    {
        return new ConcernResource($concern->load(['equipment', 'reporter', 'reviewer', 'transaction']));
    }

    /**
     * Admin-only: review the concern and optionally update the equipment condition.
     */
    public function review(ReviewConcernRequest $request, EquipmentConcern $concern)
    {
        $data = $request->validated();

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

        return new ConcernResource($concern->fresh(['equipment']));
    }
}
