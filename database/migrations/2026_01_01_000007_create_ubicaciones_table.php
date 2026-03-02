<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('ubicaciones', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('tenant_id');
            $table->string('alias', 100)->nullable();
            // CHECK constraint garantiza tipos válidos del Complemento Carta Porte
            $table->string('tipo', 10);
            $table->string('rfc_remitente', 13)->nullable();
            $table->string('nombre_remitente', 255)->nullable();
            $table->string('calle', 255)->nullable();
            $table->string('num_exterior', 20)->nullable();
            $table->string('num_interior', 20)->nullable();
            $table->string('colonia', 100)->nullable();
            $table->string('municipio', 100);
            $table->string('estado', 5);
            $table->char('pais', 3)->default('MEX');
            $table->string('codigo_postal', 5);
            $table->boolean('activo')->default(true);
            $table->timestampsTz();

            $table->foreign('tenant_id')
                ->references('id')
                ->on('empresas_tenant')
                ->onDelete('restrict');

            $table->index('tenant_id');
        });

        DB::statement("ALTER TABLE ubicaciones ALTER COLUMN created_at SET DEFAULT now()");
        DB::statement("ALTER TABLE ubicaciones ALTER COLUMN updated_at SET DEFAULT now()");
        DB::statement("ALTER TABLE ubicaciones ADD CONSTRAINT ubicaciones_tipo_check CHECK (tipo IN ('Origen', 'Destino', 'Intermedio'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('ubicaciones');
    }
};
