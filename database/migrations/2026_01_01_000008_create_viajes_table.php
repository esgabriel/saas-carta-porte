<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('viajes', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('tenant_id');
            $table->uuid('cliente_id');
            $table->uuid('vehiculo_id');
            $table->uuid('operador_id');
            $table->uuid('remolque_id')->nullable();
            $table->uuid('ubicacion_origen_id');
            $table->uuid('ubicacion_destino_id');
            $table->timestampTz('fecha_hora_salida');
            $table->timestampTz('fecha_hora_llegada_est')->nullable();
            $table->decimal('distancia_recorrida', 10, 2)->nullable();
            // CHECK constraint + DEFAULT para el flujo de vida del viaje
            $table->string('estatus', 20)->default('borrador');
            $table->timestampsTz();

            $table->foreign('tenant_id')
                ->references('id')
                ->on('empresas_tenant')
                ->onDelete('restrict');

            $table->foreign('cliente_id')
                ->references('id')
                ->on('clientes')
                ->onDelete('restrict');

            $table->foreign('vehiculo_id')
                ->references('id')
                ->on('vehiculos')
                ->onDelete('restrict');

            $table->foreign('operador_id')
                ->references('id')
                ->on('operadores')
                ->onDelete('restrict');

            $table->foreign('remolque_id')
                ->references('id')
                ->on('remolques')
                ->onDelete('set null');

            $table->foreign('ubicacion_origen_id')
                ->references('id')
                ->on('ubicaciones')
                ->onDelete('restrict');

            $table->foreign('ubicacion_destino_id')
                ->references('id')
                ->on('ubicaciones')
                ->onDelete('restrict');

            $table->index('tenant_id');
            $table->index('cliente_id');
            $table->index('vehiculo_id');
            $table->index('operador_id');
            $table->index('remolque_id');
            $table->index('ubicacion_origen_id');
            $table->index('ubicacion_destino_id');
        });

        DB::statement("ALTER TABLE viajes ALTER COLUMN created_at SET DEFAULT now()");
        DB::statement("ALTER TABLE viajes ALTER COLUMN updated_at SET DEFAULT now()");
        DB::statement("ALTER TABLE viajes ADD CONSTRAINT viajes_estatus_check CHECK (estatus IN ('borrador', 'en_proceso', 'timbrado', 'cancelado'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('viajes');
    }
};
