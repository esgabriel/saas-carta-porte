<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use App\Models\Traits\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehiculo extends Model
{
    use HasUuidPrimaryKey;

    protected $table = 'vehiculos';

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope());
    }

    protected $fillable = [
        'tenant_id',
        'placa',
        'anio_modelo',
        'config_vehicular',
        'peso_bruto_vehicular',
        'tipo_permiso_sct',
        'num_permiso_sct',
        'num_serie',
        'activo',
    ];

    protected $casts = [
        'anio_modelo' => 'integer',
        'peso_bruto_vehicular' => 'decimal:2',
        'activo' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // -------------------------------------------------------------------------
    // Relaciones
    // -------------------------------------------------------------------------

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(EmpresaTenant::class , 'tenant_id');
    }

    /** Pólizas de seguro asociadas al vehículo (RC, carga, medio ambiente). */
    public function seguros(): HasMany
    {
        return $this->hasMany(Seguro::class , 'vehiculo_id');
    }

    public function viajes(): HasMany
    {
        return $this->hasMany(Viaje::class , 'vehiculo_id');
    }
}
