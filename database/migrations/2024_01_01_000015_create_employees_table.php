<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('employee_code', 20)->unique();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('position', 100);
            $table->string('employment_type', 30);
            // full_time, part_time, contractual, per_visit
            $table->date('date_hired');
            $table->date('date_terminated')->nullable();
            $table->string('status')->default('active');
            // active, on_leave, terminated, resigned
            $table->string('phone', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->text('address')->nullable();
            $table->string('sss_number', 20)->nullable();
            $table->string('philhealth_number', 20)->nullable();
            $table->string('pagibig_number', 20)->nullable();
            $table->string('tin_number', 20)->nullable();
            $table->decimal('basic_salary', 12, 2)->default(0);
            $table->string('pay_period', 20)->default('monthly');
            // daily, weekly, bi_monthly, monthly
            $table->string('bank_name', 100)->nullable();
            $table->string('bank_account', 50)->nullable();
            $table->string('emergency_contact_name', 100)->nullable();
            $table->string('emergency_contact_phone', 20)->nullable();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('employee_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->date('attendance_date');
            $table->string('time_in', 10)->nullable();
            $table->string('time_out', 10)->nullable();
            $table->string('status', 20);
            // present, absent, late, half_day, on_leave, holiday
            $table->decimal('hours_worked', 5, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['employee_id', 'attendance_date']);
        });

        Schema::create('employee_leaves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('leave_type', 30);
            // sick, vacation, emergency, maternity, paternity, unpaid
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedSmallInteger('days_count')->default(1);
            $table->text('reason')->nullable();
            $table->string('status')->default('pending');
            // pending, approved, rejected, cancelled
            $table->timestamps();
            $table->index(['employee_id', 'status']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('employee_leaves');
        Schema::dropIfExists('employee_attendances');
        Schema::dropIfExists('employees');
    }
};
