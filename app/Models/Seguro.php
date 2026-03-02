<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use App\Models\Traits\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Seguro extends Model
{
    use HasUuidPrimaryKey;

    protected $table = 'seguros';

    /**
     * Seguro no tiene tenant_id propio, pero se filtra indirectamente
     * a través de vehiculo_id que ya pertenece al tenant.
     * El scope se aplica para queries directas sobre Seguro.
     */
    protected static function booted(): void
    {
    // Seguro no posee tenant_id: el aislamiento se delega a Vehiculo.
    // Si en el futuro se agrega tenant_id a seguros, activar esta línea:
    // static::addGlobalScope(new TenantScope());
    }

    /**
     * Valores válidos del CHECK constraint en BD:
     * 'responsabilidad_civil' | 'carga' | 'medio_ambiente'
     */
    protected $fillable = [
        'vehiculo_id',
        'aseguradora',
        'num_poliza',
        'tipo',
        'vigencia_inicio',
        'vigencia_fin',
    ];

    protected $casts = [
        'vigencia_inicio' => 'date',
        'vigencia_fin' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // -------------------------------------------------------------------------
    // Relaciones
    // -------------------------------------------------------------------------

    public function vehiculo(): BelongsTo
    {
        return $this->belongsTo(Vehiculo::class , 'vehiculo_id');
    }
}
