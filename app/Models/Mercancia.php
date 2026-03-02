<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use App\Models\Traits\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Mercancia extends Model
{
    use HasUuidPrimaryKey;

    protected $table = 'mercancias';

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope());
    }

    protected $fillable = [
        'viaje_id',
        'tenant_id',
        'clave_prod_stcc',
        'descripcion',
        'cantidad',
        'clave_unidad',
        'unidad',
        'dimensiones',
        'material_peligroso',
        'cve_material_peligroso',
        'embalaje',
        'peso_en_kg',
        'valor_mercancia',
        'moneda',
    ];

    protected $casts = [
        'cantidad' => 'decimal:3',
        'peso_en_kg' => 'decimal:3',
        'valor_mercancia' => 'decimal:2',
        'material_peligroso' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $attributes = [
        'moneda' => 'MXN',
        'material_peligroso' => false,
    ];

    // -------------------------------------------------------------------------
    // Relaciones
    // -------------------------------------------------------------------------

    public function viaje(): BelongsTo
    {
        return $this->belongsTo(Viaje::class , 'viaje_id');
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(EmpresaTenant::class , 'tenant_id');
    }
}
