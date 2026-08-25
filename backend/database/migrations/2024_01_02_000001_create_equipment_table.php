<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipment', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('asset_code')->unique();
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('total_quantity')->default(1);
            $table->unsignedInteger('available_quantity')->default(1);
            $table->enum('condition', ['good', 'fair', 'damaged', 'under_repair', 'lost'])->default('good');
            $table->enum('status', ['available', 'partially_available', 'unavailable'])->default('available');
            $table->string('qr_code')->unique()->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipment');
    }
};
