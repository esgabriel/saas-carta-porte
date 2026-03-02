<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use App\Models\Traits\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Operador extends Model
{
    use HasUuidPrimaryKey;

    protected $table = 'operadores';

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope());
    }

    protected $fillable = [
        'tenant_id',
        'nombre',
        'rfc',
        'curp',
        'num_licencia',
        'tipo_licencia',
        'vigencia_licencia',
        'activo',
    ];

    protected $casts = [
        'vigencia_licencia' => 'date',
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
        return $this->hasMany(Viaje::class , 'operador_id');
    }
}
