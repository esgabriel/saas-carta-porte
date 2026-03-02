<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use App\Models\Traits\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Viaje extends Model
{
    use HasUuidPrimaryKey;

    protected $table = 'viajes';

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope());
    }

    /**
     * Valores válidos del CHECK constraint en BD:
     * 'borrador' | 'en_proceso' | 'timbrado' | 'cancelado'
     */
    protected $fillable = [
        'tenant_id',
        'cliente_id',
        'vehiculo_id',
        'operador_id',
        'remolque_id',
        'ubicacion_origen_id',
        'ubicacion_destino_id',
        'fecha_hora_salida',
        'fecha_hora_llegada_est',
        'distancia_recorrida',
        'estatus',
    ];

    protected $casts = [
        'fecha_hora_salida' => 'datetime',
        'fecha_hora_llegada_est' => 'datetime',
        'distancia_recorrida' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $attributes = [
        'estatus' => 'borrador',
    ];

    // -------------------------------------------------------------------------
    // Relaciones
    // -------------------------------------------------------------------------

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(EmpresaTenant::class , 'tenant_id');
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class , 'cliente_id');
    }

    public function vehiculo(): BelongsTo
    {
        return $this->belongsTo(Vehiculo::class , 'vehiculo_id');
    }

    public function operador(): BelongsTo
    {
        return $this->belongsTo(Operador::class , 'operador_id');
    }

    /** Remolque es opcional (nullable en BD). */
    public function remolque(): BelongsTo
    {
        return $this->belongsTo(Remolque::class , 'remolque_id');
    }

    public function ubicacionOrigen(): BelongsTo
    {
        return $this->belongsTo(Ubicacion::class , 'ubicacion_origen_id');
    }

    public function ubicacionDestino(): BelongsTo
    {
        return $this->belongsTo(Ubicacion::class , 'ubicacion_destino_id');
    }

    /** Mercancías transportadas en este viaje (1:N). */
    public function mercancias(): HasMany
    {
        return $this->hasMany(Mercancia::class , 'viaje_id');
    }

    /** Carta Porte asociada a este viaje (1:1). */
    public function cartaPorte(): HasOne
    {
        return $this->hasOne(CartaPorte::class , 'viaje_id');
    }
}
