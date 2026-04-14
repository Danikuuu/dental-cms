<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('inventory_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('inventory_categories')->nullOnDelete();
            $table->string('name', 150);
            $table->string('sku', 50)->nullable()->unique();
            $table->string('unit', 30);
            $table->decimal('current_stock', 10, 2)->default(0);
            $table->decimal('minimum_stock', 10, 2)->default(0);
            $table->decimal('reorder_level', 10, 2)->default(0);
            $table->decimal('unit_cost', 10, 2)->default(0);
            $table->decimal('unit_price', 10, 2)->nullable();
            $table->string('supplier', 150)->nullable();
            $table->string('supplier_contact', 100)->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('storage_location', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['is_active', 'name']);
        });

        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('inventory_items')->cascadeOnDelete();
            $table->foreignId('performed_by')->constrained('users');
            $table->string('type', 30);
            // stock_in, stock_out, adjustment, expired, returned
            $table->decimal('quantity', 10, 2);
            $table->decimal('unit_cost', 10, 2)->nullable();
            $table->decimal('stock_before', 10, 2);
            $table->decimal('stock_after', 10, 2);
            $table->string('reference', 100)->nullable();
            $table->text('notes')->nullable();
            $table->date('transaction_date');
            $table->timestamps();
            $table->index(['item_id', 'transaction_date']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
        Schema::dropIfExists('inventory_items');
        Schema::dropIfExists('inventory_categories');
    }
};
