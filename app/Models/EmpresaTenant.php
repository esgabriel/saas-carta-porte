<?php

namespace App\Models;

use App\Models\Traits\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmpresaTenant extends Model
{
    use HasUuidPrimaryKey;

    protected $table = 'empresas_tenant';

    protected $fillable = [
        'nombre_razon_social',
        'rfc',
        'regimen_fiscal',
        'codigo_postal',
        'logo_url',
        'api_key_facturapi',
        'activo',
    ];

    /**
     * api_key_facturapi se almacena cifrada en reposo (AES-256-CBC vía APP_KEY).
     * Laravel cifra/descifra automáticamente al leer/escribir el campo.
     */
    protected $casts = [
        'api_key_facturapi' => 'encrypted',
        'activo' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $hidden = [
        'api_key_facturapi',
    ];

    // -------------------------------------------------------------------------
    // Relaciones
    // -------------------------------------------------------------------------

    public function clientes(): HasMany
    {
        return $this->hasMany(Cliente::class , 'tenant_id');
    }

    public function operadores(): HasMany
    {
        return $this->hasMany(Operador::class , 'tenant_id');
    }

    public function vehiculos(): HasMany
    {
        return $this->hasMany(Vehiculo::class , 'tenant_id');
    }

    public function remolques(): HasMany
    {
        return $this->hasMany(Remolque::class , 'tenant_id');
    }

    public function ubicaciones(): HasMany
    {
        return $this->hasMany(Ubicacion::class , 'tenant_id');
    }

    public function viajes(): HasMany
    {
        return $this->hasMany(Viaje::class , 'tenant_id');
    }

    public function mercancias(): HasMany
    {
        return $this->hasMany(Mercancia::class , 'tenant_id');
    }

    public function cartasPorte(): HasMany
    {
        return $this->hasMany(CartaPorte::class , 'tenant_id');
    }
}
