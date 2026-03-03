<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestTenantSeeder extends Seeder
{
    public function run(): void
    {
        $exists = DB::table('empresas_tenant')
            ->where('id', '70d298b8-a678-4382-ae96-fce6058d90be')
            ->exists();

        if (!$exists) {
            DB::table('empresas_tenant')->insert([
                'id' => '70d298b8-a678-4382-ae96-fce6058d90be',
                'nombre_razon_social' => 'Empresa de Prueba SA de CV',
                'rfc' => 'EPR123456789',
                'regimen_fiscal' => '601',
                'codigo_postal' => '06600',
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $this->command->info('Tenant de prueba creado.');
        } else {
            $this->command->info('El Tenant de prueba ya existe.');
        }
    }
}