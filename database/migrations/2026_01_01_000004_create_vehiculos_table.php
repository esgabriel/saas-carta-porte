<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('vehiculos', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('tenant_id');
            $table->string('placa', 15);
            $table->smallInteger('anio_modelo');
            $table->string('config_vehicular', 10);
            $table->decimal('peso_bruto_vehicular', 8, 2);
            // Requeridos por Complemento Carta Porte 3.0/3.1 para validar autorización SCT
            $table->string('tipo_permiso_sct', 50);
            $table->string('num_permiso_sct', 100);
            $table->string('num_serie', 50)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestampsTz();

            $table->foreign('tenant_id')
                ->references('id')
                ->on('empresas_tenant')
                ->onDelete('restrict');

            $table->index('tenant_id');
        });

        DB::statement("ALTER TABLE vehiculos ALTER COLUMN created_at SET DEFAULT now()");
        DB::statement("ALTER TABLE vehiculos ALTER COLUMN updated_at SET DEFAULT now()");
    }

    public function down(): void
    {
        Schema::dropIfExists('vehiculos');
    }
};
