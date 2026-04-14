<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('insurance_providers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('code', 20)->nullable();
            $table->string('contact_number', 30)->nullable();
            $table->string('email', 100)->nullable();
            $table->text('address')->nullable();
            $table->text('covered_procedures')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('patient_insurance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('provider_id')->constrained('insurance_providers');
            $table->string('policy_number', 100);
            $table->string('member_id', 100)->nullable();
            $table->string('group_number', 100)->nullable();
            $table->date('effective_date');
            $table->date('expiry_date')->nullable();
            $table->decimal('coverage_limit', 12, 2)->default(0);
            $table->decimal('used_amount', 12, 2)->default(0);
            $table->string('status')->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['patient_id', 'status']);
        });

        Schema::create('insurance_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_insurance_id')->constrained('patient_insurance');
            $table->foreignId('invoice_id')->constrained();
            $table->foreignId('patient_id')->constrained();
            $table->string('claim_number', 100)->nullable();
            $table->date('claim_date');
            $table->decimal('claimed_amount', 12, 2);
            $table->decimal('approved_amount', 12, 2)->nullable();
            $table->decimal('rejected_amount', 12, 2)->nullable();
            $table->string('status')->default('pending');
            // pending, submitted, approved, partial, rejected, paid
            $table->date('submission_date')->nullable();
            $table->date('approval_date')->nullable();
            $table->date('payment_date')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['patient_id', 'status']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('insurance_claims');
        Schema::dropIfExists('patient_insurance');
        Schema::dropIfExists('insurance_providers');
    }
};
