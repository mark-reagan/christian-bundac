<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('equipment_requests', function (Blueprint $table) {
            $table->uuid('tracking_token')->nullable()->unique()->after('id');
        });

        Schema::table('supply_requests', function (Blueprint $table) {
            $table->uuid('tracking_token')->nullable()->unique()->after('id');
        });

        DB::table('equipment_requests')->whereNull('tracking_token')->eachById(function (object $request) {
            DB::table('equipment_requests')->where('id', $request->id)->update(['tracking_token' => (string) Str::uuid()]);
        });

        DB::table('supply_requests')->whereNull('tracking_token')->eachById(function (object $request) {
            DB::table('supply_requests')->where('id', $request->id)->update(['tracking_token' => (string) Str::uuid()]);
        });
    }

    public function down(): void
    {
        Schema::table('equipment_requests', function (Blueprint $table) {
            $table->dropUnique(['tracking_token']);
            $table->dropColumn('tracking_token');
        });

        Schema::table('supply_requests', function (Blueprint $table) {
            $table->dropUnique(['tracking_token']);
            $table->dropColumn('tracking_token');
        });
    }
};