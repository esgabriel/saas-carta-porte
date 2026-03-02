<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('remolques', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('tenant_id');
            $table->string('placa', 15);
            $table->string('subtipo_rem', 10);
            $table->boolean('activo')->default(true);
            $table->timestampsTz();

            $table->foreign('tenant_id')
                ->references('id')
                ->on('empresas_tenant')
                ->onDelete('restrict');

            $table->index('tenant_id');
        });

        DB::statement("ALTER TABLE remolques ALTER COLUMN created_at SET DEFAULT now()");
        DB::statement("ALTER TABLE remolques ALTER COLUMN updated_at SET DEFAULT now()");
    }

    public function down(): void
    {
        Schema::dropIfExists('remolques');
    }
};
