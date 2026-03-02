<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use App\Models\Traits\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ubicacion extends Model
{
    use HasUuidPrimaryKey;

    protected $table = 'ubicaciones';

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope());
    }

    /**
     * Valores válidos del CHECK constraint en BD:
     * 'Origen' | 'Destino' | 'Intermedio'
     */
    protected $fillable = [
        'tenant_id',
        'alias',
        'tipo',
        'rfc_remitente',
        'nombre_remitente',
        'calle',
        'num_exterior',
        'num_interior',
        'colonia',
        'municipio',
        'estado',
        'pais',
        'codigo_postal',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $attributes = [
        'pais' => 'MEX',
    ];

    // -------------------------------------------------------------------------
    // Relaciones
    // -------------------------------------------------------------------------

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(EmpresaTenant::class , 'tenant_id');
    }

    /** Viajes donde esta ubicación es el origen. */
    public function viajesComoOrigen(): HasMany
    {
        return $this->hasMany(Viaje::class , 'ubicacion_origen_id');
    }

    /** Viajes donde esta ubicación es el destino. */
    public function viajesComoDestino(): HasMany
    {
        return $this->hasMany(Viaje::class , 'ubicacion_destino_id');
    }
}
