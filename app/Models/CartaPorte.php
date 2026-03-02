<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use App\Models\Traits\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartaPorte extends Model
{
    use HasUuidPrimaryKey;

    protected $table = 'cartas_porte';

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope());
    }

    /**
     * Valores válidos del CHECK constraint en BD:
     * 'pendiente' | 'timbrado' | 'cancelado' | 'error'
     */
    protected $fillable = [
        'viaje_id',
        'tenant_id',
        'facturapi_id',
        'uuid_timbrado',
        'serie',
        'folio',
        'subtotal',
        'total',
        'moneda',
        'tipo_cambio',
        'xml_url',
        'pdf_url',
        'estatus',
        'error_detalle',
        'fecha_timbrado',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'total' => 'decimal:2',
        'tipo_cambio' => 'decimal:4',
        'fecha_timbrado' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $attributes = [
        'estatus' => 'pendiente',
        'moneda' => 'MXN',
        'tipo_cambio' => 1,
        'subtotal' => 0,
        'total' => 0,
    ];

    // -------------------------------------------------------------------------
    // Relaciones
    // -------------------------------------------------------------------------

    /** Relación 1:1 — cada carta porte pertenece a un único viaje (UNIQUE en BD). */
    public function viaje(): BelongsTo
    {
        return $this->belongsTo(Viaje::class , 'viaje_id');
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(EmpresaTenant::class , 'tenant_id');
    }
}
