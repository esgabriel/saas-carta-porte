<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('cartas_porte', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            // UNIQUE en viaje_id enforces la relación 1:1 con viajes directamente en la BD
            $table->uuid('viaje_id')->unique();
            $table->uuid('tenant_id');
            $table->string('facturapi_id', 100)->nullable();
            $table->uuid('uuid_timbrado')->nullable();
            $table->string('serie', 10)->nullable();
            $table->string('folio', 20)->nullable();
            $table->decimal('subtotal', 14, 2)->default(0);
            $table->decimal('total', 14, 2)->default(0);
            $table->char('moneda', 3)->default('MXN');
            $table->decimal('tipo_cambio', 10, 4)->default(1);
            $table->text('xml_url')->nullable();
            $table->text('pdf_url')->nullable();
            // CHECK constraint para el ciclo de vida del documento fiscal
            $table->string('estatus', 20)->default('pendiente');
            $table->text('error_detalle')->nullable();
            $table->timestampTz('fecha_timbrado')->nullable();
            $table->timestampsTz();

            $table->foreign('viaje_id')
                ->references('id')
                ->on('viajes')
                ->onDelete('restrict');

            $table->foreign('tenant_id')
                ->references('id')
                ->on('empresas_tenant')
                ->onDelete('restrict');

            $table->index('tenant_id');
            $table->index('viaje_id');
        });

        DB::statement("ALTER TABLE cartas_porte ALTER COLUMN created_at SET DEFAULT now()");
        DB::statement("ALTER TABLE cartas_porte ALTER COLUMN updated_at SET DEFAULT now()");
        DB::statement("ALTER TABLE cartas_porte ADD CONSTRAINT cartas_porte_estatus_check CHECK (estatus IN ('pendiente', 'timbrado', 'cancelado', 'error'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('cartas_porte');
    }
};
