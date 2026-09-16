<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            if (Schema::hasColumn('students', 'First_name')) {
                $table->renameColumn('First_name', 'first_name');
            }

            if (Schema::hasColumn('students', 'Last_name')) {
                $table->renameColumn('Last_name', 'last_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            if (Schema::hasColumn('students', 'first_name')) {
                $table->renameColumn('first_name', 'First_name');
            }

            if (Schema::hasColumn('students', 'last_name')) {
                $table->renameColumn('last_name', 'Last_name');
            }
        });
    }
};