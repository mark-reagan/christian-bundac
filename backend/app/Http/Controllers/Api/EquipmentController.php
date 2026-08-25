<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EquipmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Equipment::query()->where('is_active', true);

        if ($request->filled('search')) {
            $s = $request->string('search');
            $query->where(fn ($q) => $q->where('name', 'like', "%{$s}%")->orWhere('asset_code', 'like', "%{$s}%"));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('condition')) {
            $query->where('condition', $request->string('condition'));
        }

        return response()->json($query->orderBy('name')->paginate(20));
    }

    public function show(Equipment $equipment)
    {
        return response()->json($equipment);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'total_quantity' => ['required', 'integer', 'min:1'],
            'condition' => ['nullable', 'in:good,fair,damaged,under_repair,lost'],
        ]);

        $data['asset_code'] = 'EQ-'.strtoupper(Str::random(8));
        $data['qr_code'] = Str::uuid()->toString();
        $data['available_quantity'] = $data['total_quantity'];
        $data['status'] = 'available';

        $equipment = Equipment::create($data);

        return response()->json($equipment, 201);
    }

    public function update(Request $request, Equipment $equipment)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'total_quantity' => ['sometimes', 'integer', 'min:0'],
            'condition' => ['sometimes', 'in:good,fair,damaged,under_repair,lost'],
        ]);

        if (isset($data['total_quantity'])) {
            $diff = $data['total_quantity'] - $equipment->total_quantity;
            $equipment->available_quantity = max(0, $equipment->available_quantity + $diff);
        }

        $equipment->fill($data);
        $equipment->save();
        $equipment->refreshStatus();

        return response()->json($equipment);
    }

    public function deactivate(Equipment $equipment)
    {
        $equipment->update(['is_active' => false]);

        return response()->json(['message' => 'Equipment deactivated.', 'equipment' => $equipment]);
    }

    public function destroy(Equipment $equipment)
    {
        $equipment->delete();

        return response()->json(['message' => 'Equipment deleted.']);
    }
}
