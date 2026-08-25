<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supply;
use Illuminate\Http\Request;

class SupplyController extends Controller
{
    public function index(Request $request)
    {
        $query = Supply::query()->where('is_active', true);

        if ($request->filled('search')) {
            $query->where('name', 'like', '%'.$request->string('search').'%');
        }
        if ($request->boolean('low_stock')) {
            $query->whereColumn('stock_quantity', '<=', 'reorder_level');
        }

        return response()->json($query->orderBy('name')->paginate(20));
    }

    public function show(Supply $supply)
    {
        return response()->json($supply);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'unit' => ['nullable', 'string', 'max:50'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'reorder_level' => ['nullable', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
        ]);

        $supply = Supply::create($data);

        return response()->json($supply, 201);
    }

    public function update(Request $request, Supply $supply)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'unit' => ['nullable', 'string', 'max:50'],
            'stock_quantity' => ['sometimes', 'integer', 'min:0'],
            'reorder_level' => ['nullable', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
        ]);

        $supply->update($data);

        return response()->json($supply);
    }

    public function deactivate(Supply $supply)
    {
        $supply->update(['is_active' => false]);

        return response()->json(['message' => 'Supply deactivated.', 'supply' => $supply]);
    }

    public function destroy(Supply $supply)
    {
        $supply->delete();

        return response()->json(['message' => 'Supply deleted.']);
    }
}
