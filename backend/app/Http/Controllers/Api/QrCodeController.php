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
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Writer\PngWriter;

/**
 * QR Code-based equipment release/return.
 * Each Equipment record has a unique qr_code token. Staff scan it (or type it in)
 * to look up the item's current actionable transaction, then confirm release/return.
 */
class QrCodeController extends Controller
{
    /**
     * Return a base64 PNG of the QR code for a given equipment item.
     */
    public function show(Equipment $equipment)
    {
        $result = (new Builder(
            writer: new PngWriter,
            data: $equipment->qr_code,
            encoding: new Encoding('UTF-8'),
            errorCorrectionLevel: ErrorCorrectionLevel::High,
            size: 300,
            margin: 10,
        ))->build();

        return response()->json([
            'equipment_id' => $equipment->id,
            'asset_code' => $equipment->asset_code,
            'qr_code' => $equipment->qr_code,
            'qr_image_base64' => $result->getDataUri(),
        ]);
    }

    /**
     * Staff scans/enters a QR code value. Returns the equipment plus any
     * request that is actionable right now (approved & awaiting release,
     * or released & awaiting return).
     */
    public function scan(ScanQrCodeRequest $request)
    {
        $data = $request->validated();

        $equipment = Equipment::where('qr_code', $data['code'])->first();
        if (! $equipment) {
            return response()->json(['message' => 'No equipment found for this QR code.'], 404);
        }

        $awaitingRelease = EquipmentRequest::where('equipment_id', $equipment->id)
            ->where('status', 'approved')
            ->orderBy('start_date')
            ->first();

        $awaitingReturn = EquipmentTransaction::whereHas('equipmentRequest', function ($q) use ($equipment) {
            $q->where('equipment_id', $equipment->id);
        })->where('status', 'released')->first();

        return response()->json([
            'equipment' => new EquipmentResource($equipment),
            'awaiting_release_request' => $awaitingRelease ? new EquipmentRequestResource($awaitingRelease) : null,
            'awaiting_return_transaction' => $awaitingReturn ? new EquipmentTransactionResource($awaitingReturn->load('equipmentRequest.user')) : null,
        ]);
    }
}
