<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConcernController;
use App\Http\Controllers\Api\EquipmentController;
use App\Http\Controllers\Api\EquipmentRequestController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\QrCodeController;
use App\Http\Controllers\Api\ReleaseReturnController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SupplyController;
use App\Http\Controllers\Api\SupplyRequestController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']); // faculty / outsider self-signup
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Authenticated routes (any active role)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Read-only inventory browsing available to every authenticated role.
    Route::get('/equipment', [EquipmentController::class, 'index']);
    Route::get('/equipment/{equipment}', [EquipmentController::class, 'show']);
    Route::get('/supplies', [SupplyController::class, 'index']);
    Route::get('/supplies/{supply}', [SupplyController::class, 'show']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread', [NotificationController::class, 'unread']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    // Equipment requests: faculty + outsider create; admin/staff/owner can view.
    Route::get('/equipment-requests', [EquipmentRequestController::class, 'index']);
    Route::get('/equipment-requests/{equipmentRequest}', [EquipmentRequestController::class, 'show']);
    Route::post('/equipment-requests', [EquipmentRequestController::class, 'store'])
        ->middleware('role:faculty,outsider');
    Route::post('/equipment-requests/{equipmentRequest}/cancel', [EquipmentRequestController::class, 'cancel']);

    // Supply requests: faculty only create; admin/staff/owner can view.
    Route::get('/supply-requests', [SupplyRequestController::class, 'index']);
    Route::get('/supply-requests/{supplyRequest}', [SupplyRequestController::class, 'show']);
    Route::post('/supply-requests', [SupplyRequestController::class, 'store'])
        ->middleware('role:faculty');
    Route::post('/supply-requests/{supplyRequest}/cancel', [SupplyRequestController::class, 'cancel']);

    // Concerns: faculty/outsider/staff may report; admin reviews (see below).
    Route::get('/concerns', [ConcernController::class, 'index']);
    Route::get('/concerns/{concern}', [ConcernController::class, 'show']);
    Route::post('/concerns', [ConcernController::class, 'store'])
        ->middleware('role:faculty,outsider,staff');

    /*
    |----------------------------------------------------------------------
    | Admin-only
    |----------------------------------------------------------------------
    */
    Route::middleware('role:admin')->group(function () {
        // User account management
        Route::apiResource('/users', UserController::class)->except(['destroy']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::post('/users/{user}/deactivate', [UserController::class, 'deactivate']);
        Route::post('/users/{user}/activate', [UserController::class, 'activate']);

        // Inventory management (create/edit/deactivate)
        Route::post('/equipment', [EquipmentController::class, 'store']);
        Route::put('/equipment/{equipment}', [EquipmentController::class, 'update']);
        Route::post('/equipment/{equipment}/deactivate', [EquipmentController::class, 'deactivate']);
        Route::delete('/equipment/{equipment}', [EquipmentController::class, 'destroy']);

        Route::post('/supplies', [SupplyController::class, 'store']);
        Route::put('/supplies/{supply}', [SupplyController::class, 'update']);
        Route::post('/supplies/{supply}/deactivate', [SupplyController::class, 'deactivate']);
        Route::delete('/supplies/{supply}', [SupplyController::class, 'destroy']);

        // Request approval/decline
        Route::post('/equipment-requests/{equipmentRequest}/approve', [EquipmentRequestController::class, 'approve']);
        Route::post('/equipment-requests/{equipmentRequest}/decline', [EquipmentRequestController::class, 'decline']);
        Route::post('/supply-requests/{supplyRequest}/approve', [SupplyRequestController::class, 'approve']);
        Route::post('/supply-requests/{supplyRequest}/decline', [SupplyRequestController::class, 'decline']);

        // Concern review
        Route::post('/concerns/{concern}/review', [ConcernController::class, 'review']);

        // Reports
        Route::get('/reports/dashboard', [ReportController::class, 'dashboard']);
        Route::get('/reports/equipment', [ReportController::class, 'equipmentReport']);
        Route::get('/reports/supplies', [ReportController::class, 'supplyReport']);
        Route::get('/reports/supply-usage', [ReportController::class, 'supplyUsageReport']);
        Route::get('/reports/transactions', [ReportController::class, 'transactionReport']);
    });

    /*
    |----------------------------------------------------------------------
    | Staff-only: physical release / return / QR scanning
    |----------------------------------------------------------------------
    */
    Route::middleware('role:staff')->group(function () {
        Route::post('/equipment-requests/{equipmentRequest}/release', [ReleaseReturnController::class, 'releaseEquipment']);
        Route::post('/equipment-transactions/{equipmentTransaction}/return', [ReleaseReturnController::class, 'returnEquipment']);
        Route::post('/supply-requests/{supplyRequest}/release', [ReleaseReturnController::class, 'releaseSupply']);

        Route::post('/qrcode/scan', [QrCodeController::class, 'scan']);
    });

    // QR image lookup usable by admin (to print/display) and staff (to scan context)
    Route::middleware('role:admin,staff')->group(function () {
        Route::get('/equipment/{equipment}/qrcode', [QrCodeController::class, 'show']);
    });
});
