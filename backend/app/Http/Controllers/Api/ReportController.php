<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use App\Models\EquipmentConcern;
use App\Models\EquipmentRequest;
use App\Models\EquipmentTransaction;
use App\Models\Supply;
use App\Models\SupplyRequest;
use App\Models\SupplyTransaction;
use Illuminate\Http\Request;

/**
 * Admin-only: Records & Reports.
 */
class ReportController extends Controller
{
    public function dashboard()
    {
        return response()->json([
            'total_equipment' => Equipment::where('is_active', true)->count(),
            'total_supplies' => Supply::where('is_active', true)->count(),
            'low_stock_supplies' => Supply::whereColumn('stock_quantity', '<=', 'reorder_level')->count(),
            'pending_equipment_requests' => EquipmentRequest::where('status', 'pending')->count(),
            'pending_supply_requests' => SupplyRequest::where('status', 'pending')->count(),
            'active_equipment_loans' => EquipmentTransaction::where('status', 'released')->count(),
            'open_concerns' => EquipmentConcern::where('status', 'open')->count(),
        ]);
    }

    public function equipmentReport(Request $request)
    {
        $query = Equipment::query();

        if ($request->filled('condition')) {
            $query->where('condition', $request->string('condition'));
        }

        return response()->json($query->withCount(['requests', 'concerns'])->orderBy('name')->get());
    }

    public function supplyReport()
    {
        return response()->json(Supply::withCount('requests')->orderBy('name')->get());
    }

    public function supplyUsageReport(Request $request)
    {
        $query = SupplyTransaction::with(['supplyRequest.supply', 'supplyRequest.user', 'releasedBy']);

        if ($request->filled('from')) {
            $query->whereDate('released_at', '>=', $request->date('from'));
        }
        if ($request->filled('to')) {
            $query->whereDate('released_at', '<=', $request->date('to'));
        }

        return response()->json($query->orderByDesc('released_at')->paginate(30));
    }

    public function transactionReport(Request $request)
    {
        $equipmentTx = EquipmentTransaction::with(['equipmentRequest.equipment', 'equipmentRequest.user'])
            ->orderByDesc('id')->limit(50)->get();

        $supplyTx = SupplyTransaction::with(['supplyRequest.supply', 'supplyRequest.user'])
            ->orderByDesc('id')->limit(50)->get();

        return response()->json([
            'equipment_transactions' => $equipmentTx,
            'supply_transactions' => $supplyTx,
        ]);
    }
}
