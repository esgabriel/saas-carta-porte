<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('operadores', function (Blueprint $table) {
            $table->string('calle', 255)->nullable()->after('activo');
            $table->string('municipio', 100)->nullable()->after('calle');
            $table->string('estado', 100)->nullable()->after('municipio');
            $table->string('codigo_postal', 10)->nullable()->after('estado');
        });
    }

    public function down(): void
    {
        Schema::table('operadores', function (Blueprint $table) {
            $table->dropColumn(['calle', 'municipio', 'estado', 'codigo_postal']);
        });
    }
};
