<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EquipmentRequestResource;
use App\Http\Resources\SupplyRequestResource;
use App\Models\EquipmentRequest;
use App\Models\SupplyRequest;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Http\Request;

class PublicRequestController extends Controller
{
    public function show(Request $request, string $trackingToken)
    {
        $equipmentRequest = EquipmentRequest::with(['equipment', 'transaction'])
            ->where('tracking_token', $trackingToken)
            ->first();

        if ($equipmentRequest) {
            return response()->json([
                'type' => 'equipment',
                'request' => new EquipmentRequestResource($equipmentRequest),
            ]);
        }

        $supplyRequest = SupplyRequest::with(['supply', 'transaction'])
            ->where('tracking_token', $trackingToken)
            ->first();

        if ($supplyRequest) {
            return response()->json([
                'type' => 'supply',
                'request' => new SupplyRequestResource($supplyRequest),
            ]);
        }

        return response()->json(['message' => 'Request not found.'], 404);
    }

    public function qr(string $trackingToken)
    {
        $exists = EquipmentRequest::where('tracking_token', $trackingToken)->exists()
            || SupplyRequest::where('tracking_token', $trackingToken)->exists();

        abort_unless($exists, 404);

        $trackingUrl = rtrim(config('app.frontend_url'), '/').'/track/'.$trackingToken;
        $result = (new Builder(
            writer: new PngWriter,
            data: $trackingUrl,
            encoding: new Encoding('UTF-8'),
            errorCorrectionLevel: ErrorCorrectionLevel::High,
            size: 360,
            margin: 12,
        ))->build();

        return response($result->getString(), 200, ['Content-Type' => 'image/png']);
    }
}