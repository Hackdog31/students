<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentController;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('students-dashboard', [StudentController::class, 'studentsDashboard'])
        ->name('students.dashboard');
    Route::post('students', [StudentController::class, 'store'])
        ->name('students.store');
    Route::put('students/{student}', [StudentController::class, 'update'])
        ->name('students.update');
    Route::delete('students/{student}', [StudentController::class, 'destroy'])
        ->name('students.destroy');
});

require __DIR__.'/settings.php';