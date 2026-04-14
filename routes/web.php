<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DentalChartController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\InsuranceController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PatientImageController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SmsController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\TreatmentPlanController;
use App\Http\Controllers\TreatmentTimelineController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('dashboard'));

Route::middleware(['auth'])->group(function () {

    // ── Dashboard ─────────────────────────────────────────────────────────
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── Patients ──────────────────────────────────────────────────────────
    Route::resource('patients', PatientController::class);
    Route::post('/patients/{patient}/images', [PatientImageController::class, 'store'])->name('patient-images.store');
    Route::delete('/patient-images/{image}',  [PatientImageController::class, 'destroy'])->name('patient-images.destroy');
    Route::get('/patients/{patient}/timeline',       [TreatmentTimelineController::class, 'show'])->name('timeline.show');
    Route::post('/patients/{patient}/timeline/note', [TreatmentTimelineController::class, 'storeNote'])->name('timeline.note');

    // ── Appointments ──────────────────────────────────────────────────────
    Route::resource('appointments', AppointmentController::class)->only(['index', 'store', 'update', 'destroy']);

    // ── Dental Chart (dentist + admin) ────────────────────────────────────
    Route::middleware('role:admin,dentist')->group(function () {
        Route::post('/dental-chart',           [DentalChartController::class, 'store'])->name('dental-chart.store');
        Route::delete('/dental-chart/{entry}', [DentalChartController::class, 'destroy'])->name('dental-chart.destroy');
    });

    // ── Treatment Plans ───────────────────────────────────────────────────
    Route::get('/treatment-plans', [TreatmentPlanController::class, 'index'])->name('treatment-plans.index');
    Route::middleware('role:admin,dentist')->group(function () {
        Route::post('/treatment-plans',                          [TreatmentPlanController::class, 'store'])->name('treatment-plans.store');
        Route::put('/treatment-plans/{plan}',                    [TreatmentPlanController::class, 'update'])->name('treatment-plans.update');
        Route::delete('/treatment-plans/{plan}',                 [TreatmentPlanController::class, 'destroy'])->name('treatment-plans.destroy');
        Route::put('/treatment-plans/{plan}/items/{item}',       [TreatmentPlanController::class, 'updateItem'])->name('treatment-plans.items.update');
    });

    // ── Billing ───────────────────────────────────────────────────────────
    Route::prefix('billing')->name('invoices.')->group(function () {
        Route::get('/',                   [InvoiceController::class, 'index'])->name('index');
        Route::get('/create',             [InvoiceController::class, 'create'])->name('create');
        Route::post('/',                  [InvoiceController::class, 'store'])->name('store');
        Route::get('/{invoice}',          [InvoiceController::class, 'show'])->name('show');
        Route::post('/{invoice}/payment', [InvoiceController::class, 'recordPayment'])->name('payment');
        Route::post('/{invoice}/or',      [InvoiceController::class, 'issueOfficialReceipt'])->name('or');
    });

    // ── Insurance ─────────────────────────────────────────────────────────
    Route::prefix('insurance')->name('insurance.')->group(function () {
        Route::get('/',                   [InsuranceController::class, 'index'])->name('index');
        Route::post('/providers',         [InsuranceController::class, 'storeProvider'])->name('providers.store');
        Route::post('/patient-insurance', [InsuranceController::class, 'storePatientInsurance'])->name('patient.store');
        Route::post('/claims',            [InsuranceController::class, 'storeClaim'])->name('claims.store');
        Route::put('/claims/{claim}',     [InsuranceController::class, 'updateClaim'])->name('claims.update');
    });

    // ── Inventory ─────────────────────────────────────────────────────────
    // IMPORTANT: static routes (/categories) must come BEFORE wildcard routes (/{item})
    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::get('/',                    [InventoryController::class, 'index'])->name('index');
        Route::post('/',                   [InventoryController::class, 'store'])->name('store');
        Route::post('/categories',         [InventoryController::class, 'storeCategory'])->name('categories.store');  // ← before /{item}
        Route::put('/{item}',              [InventoryController::class, 'update'])->name('update');
        Route::post('/{item}/transaction', [InventoryController::class, 'transaction'])->name('transaction');
        Route::get('/{item}/transactions', [InventoryController::class, 'transactions'])->name('transactions');
    });

    // ── SMS Reminders ─────────────────────────────────────────────────────
    // IMPORTANT: static routes (/send, /bulk, /settings, /toggle) must come BEFORE wildcard (/{reminder})
    Route::prefix('sms')->name('sms.')->group(function () {
        Route::get('/',              [SmsController::class, 'index'])->name('index');
        Route::post('/send',         [SmsController::class, 'send'])->name('send');
        Route::post('/bulk',         [SmsController::class, 'bulkReminders'])->name('bulk');
        Route::middleware('role:admin')->post('/settings', [SmsController::class, 'saveSettings'])->name('settings');
        Route::middleware('role:admin')->post('/toggle',   [SmsController::class, 'toggle'])->name('toggle');
        Route::delete('/{reminder}', [SmsController::class, 'cancel'])->name('cancel');  // ← after static routes
    });

    // ── Employees (admin only) ────────────────────────────────────────────
    // IMPORTANT: static routes (/attendance, /leaves) must come BEFORE wildcard (/{employee})
    Route::middleware('role:admin')->prefix('employees')->name('employees.')->group(function () {
        Route::get('/',                [EmployeeController::class, 'index'])->name('index');
        Route::post('/',               [EmployeeController::class, 'store'])->name('store');
        Route::post('/attendance',     [EmployeeController::class, 'attendance'])->name('attendance');      // ← before /{employee}
        Route::post('/leaves',         [EmployeeController::class, 'storeLeave'])->name('leaves.store');   // ← before /{employee}
        Route::put('/leaves/{leave}',  [EmployeeController::class, 'updateLeave'])->name('leaves.update');
        Route::get('/{employee}',      [EmployeeController::class, 'show'])->name('show');
        Route::put('/{employee}',      [EmployeeController::class, 'update'])->name('update');
    });

    // ── Reports (admin + dentist) ─────────────────────────────────────────
    Route::middleware('role:admin,dentist')->prefix('reports')->name('reports.')->group(function () {
        Route::get('/daily-collection', [ReportController::class, 'dailyCollection'])->name('daily-collection');
        Route::get('/patient-visits',   [ReportController::class, 'patientVisits'])->name('patient-visits');
    });

    // ── Templates ─────────────────────────────────────────────────────────
    // IMPORTANT: /create and /{template}/render must come BEFORE /{template}
    Route::get('/templates',                    [TemplateController::class, 'index'])->name('templates.index');
    Route::get('/templates/{template}/render',  [TemplateController::class, 'render'])->name('templates.render');
    Route::middleware('role:admin,dentist')->group(function () {
        Route::post('/templates',               [TemplateController::class, 'store'])->name('templates.store');
        Route::put('/templates/{template}',     [TemplateController::class, 'update'])->name('templates.update');
        Route::delete('/templates/{template}',  [TemplateController::class, 'destroy'])->name('templates.destroy');
    });

    // ── Services (admin only) ─────────────────────────────────────────────
    Route::middleware('role:admin')->prefix('services')->name('services.')->group(function () {
        Route::post('/',            [ServiceController::class, 'store'])->name('store');
        Route::put('/{service}',    [ServiceController::class, 'update'])->name('update');
        Route::delete('/{service}', [ServiceController::class, 'destroy'])->name('destroy');
    });

    // ── Settings (admin only) ─────────────────────────────────────────────
    Route::middleware('role:admin')->prefix('settings')->name('settings.')->group(function () {
        Route::get('/',             [SettingsController::class, 'index'])->name('index');
        Route::post('/clinic',      [SettingsController::class, 'updateClinic'])->name('clinic');
        Route::post('/users',       [SettingsController::class, 'storeUser'])->name('users.store');
        Route::put('/users/{user}', [SettingsController::class, 'updateUser'])->name('users.update');
    });

    // ── Activity Log (admin only) ─────────────────────────────────────────
    Route::middleware('role:admin')
        ->get('/activity-log', [ActivityLogController::class, 'index'])
        ->name('activity-log.index');
});

require __DIR__ . '/auth.php';