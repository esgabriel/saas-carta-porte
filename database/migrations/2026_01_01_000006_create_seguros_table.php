<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('seguros', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('vehiculo_id');
            $table->string('aseguradora', 255);
            $table->string('num_poliza', 100);
            // CHECK constraint garantiza integridad a nivel BD (RC + carga + medio ambiente)
            $table->string('tipo', 30);
            $table->date('vigencia_inicio');
            $table->date('vigencia_fin');
            $table->timestampsTz();

            $table->foreign('vehiculo_id')
                ->references('id')
                ->on('vehiculos')
                ->onDelete('restrict');

            $table->index('vehiculo_id');
        });

        DB::statement("ALTER TABLE seguros ALTER COLUMN created_at SET DEFAULT now()");
        DB::statement("ALTER TABLE seguros ALTER COLUMN updated_at SET DEFAULT now()");
        DB::statement("ALTER TABLE seguros ADD CONSTRAINT seguros_tipo_check CHECK (tipo IN ('responsabilidad_civil', 'carga', 'medio_ambiente'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('seguros');
    }
};
