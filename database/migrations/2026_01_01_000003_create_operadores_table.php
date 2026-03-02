<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('operadores', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('tenant_id');
            $table->string('nombre', 255);
            // RFC nullable: el SAT no siempre lo exige según tipo de operador
            $table->string('rfc', 13)->nullable();
            $table->string('curp', 18);
            $table->string('num_licencia', 50);
            $table->string('tipo_licencia', 10);
            $table->date('vigencia_licencia');
            $table->boolean('activo')->default(true);
            $table->timestampsTz();

            $table->foreign('tenant_id')
                ->references('id')
                ->on('empresas_tenant')
                ->onDelete('restrict');

            $table->index('tenant_id');
        });

        DB::statement("ALTER TABLE operadores ALTER COLUMN created_at SET DEFAULT now()");
        DB::statement("ALTER TABLE operadores ALTER COLUMN updated_at SET DEFAULT now()");
    }

    public function down(): void
    {
        Schema::dropIfExists('operadores');
    }
};
