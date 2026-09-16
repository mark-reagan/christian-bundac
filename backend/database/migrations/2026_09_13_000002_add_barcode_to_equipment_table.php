<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('equipment', function (Blueprint $table) {
            $table->string('barcode')->nullable()->unique();
        });

        DB::table('equipment')->orderBy('id')->each(function ($equipment) {
            DB::table('equipment')->where('id', $equipment->id)->update([
                'barcode' => 'EQ-'.str_pad((string) $equipment->id, 8, '0', STR_PAD_LEFT),
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('equipment', function (Blueprint $table) {
            $table->dropUnique(['barcode']);
            $table->dropColumn('barcode');
        });
    }
};
