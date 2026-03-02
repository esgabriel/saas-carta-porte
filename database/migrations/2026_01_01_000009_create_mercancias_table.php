<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('mercancias', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('viaje_id');
            $table->uuid('tenant_id');
            $table->string('clave_prod_stcc', 10);
            $table->string('descripcion', 1000);
            $table->decimal('cantidad', 12, 3);
            $table->string('clave_unidad', 10);
            $table->string('unidad', 50)->nullable();
            $table->string('dimensiones', 100)->nullable();
            $table->boolean('material_peligroso')->default(false);
            $table->string('cve_material_peligroso', 10)->nullable();
            $table->string('embalaje', 10)->nullable();
            $table->decimal('peso_en_kg', 10, 3);
            $table->decimal('valor_mercancia', 14, 2)->nullable();
            $table->char('moneda', 3)->default('MXN');
            $table->timestampsTz();

            $table->foreign('viaje_id')
                ->references('id')
                ->on('viajes')
                ->onDelete('restrict');

            $table->foreign('tenant_id')
                ->references('id')
                ->on('empresas_tenant')
                ->onDelete('restrict');

            $table->index('viaje_id');
            $table->index('tenant_id');
        });

        DB::statement("ALTER TABLE mercancias ALTER COLUMN created_at SET DEFAULT now()");
        DB::statement("ALTER TABLE mercancias ALTER COLUMN updated_at SET DEFAULT now()");
    }

    public function down(): void
    {
        Schema::dropIfExists('mercancias');
    }
};
