<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('tenant_id');
            $table->string('nombre_razon_social', 255);
            $table->string('rfc', 13);
            $table->string('regimen_fiscal', 10);
            $table->string('uso_cfdi', 10);
            $table->string('correo', 255)->nullable();
            $table->string('telefono', 20)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestampsTz();

            $table->foreign('tenant_id')
                ->references('id')
                ->on('empresas_tenant')
                ->onDelete('restrict');

            $table->index('tenant_id');
        });

        DB::statement("ALTER TABLE clientes ALTER COLUMN created_at SET DEFAULT now()");
        DB::statement("ALTER TABLE clientes ALTER COLUMN updated_at SET DEFAULT now()");
    }

    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};
