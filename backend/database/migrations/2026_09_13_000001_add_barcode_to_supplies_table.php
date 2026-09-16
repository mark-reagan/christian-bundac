<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('supplies', function (Blueprint $table) {
            $table->string('barcode')->nullable()->unique();
        });

        DB::table('supplies')->orderBy('id')->each(function ($supply) {
            DB::table('supplies')->where('id', $supply->id)->update([
                'barcode' => 'SUP-'.str_pad((string) $supply->id, 8, '0', STR_PAD_LEFT),
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('supplies', function (Blueprint $table) {
            $table->dropUnique(['barcode']);
            $table->dropColumn('barcode');
        });
    }
};