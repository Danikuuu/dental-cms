<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('category', 100);
            $table->decimal('base_fee', 10, 2)->default(0);
            $table->text('description')->nullable();
            $table->string('code', 20)->nullable();
            $table->boolean('is_vat_inclusive')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['category', 'is_active']);
        });
    }
    public function down(): void { Schema::dropIfExists('services'); }
};
