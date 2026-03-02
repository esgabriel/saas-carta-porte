<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        // Habilitar extensión pgcrypto para gen_random_uuid()
        DB::statement('CREATE EXTENSION IF NOT EXISTS pgcrypto');

        Schema::create('empresas_tenant', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('nombre_razon_social', 255);
            $table->string('rfc', 13)->unique();
            $table->string('regimen_fiscal', 10);
            $table->string('codigo_postal', 5);
            $table->text('logo_url')->nullable();
            // api_key_facturapi almacenada encriptada en reposo (AES-256-CBC vía APP_KEY)
            $table->text('api_key_facturapi')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestampsTz();
        });

        DB::statement("ALTER TABLE empresas_tenant ALTER COLUMN created_at SET DEFAULT now()");
        DB::statement("ALTER TABLE empresas_tenant ALTER COLUMN updated_at SET DEFAULT now()");
    }

    public function down(): void
    {
        Schema::dropIfExists('empresas_tenant');
    }
};
