<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use App\Models\Traits\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cliente extends Model
{
    use HasUuidPrimaryKey;

    protected $table = 'clientes';

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope());
    }

    protected $fillable = [
        'tenant_id',
        'nombre_razon_social',
        'rfc',
        'regimen_fiscal',
        'uso_cfdi',
        'correo',
        'telefono',
        'activo',
    ];

    protected $casts = [
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

    public function viajes(): HasMany
    {
        return $this->hasMany(Viaje::class , 'cliente_id');
    }
}
