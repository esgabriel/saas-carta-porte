<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    /**
     * Aplica el scope a una consulta Eloquent dado.
     * Lee el tenant_id resuelto desde el contenedor (TenantContext).
     */
    public function apply(Builder $builder, Model $model): void
    {
        $tenantContext = app(\App\Services\TenantContext::class);

        if ($tenantContext->getTenantId() !== null) {
            $builder->where($model->getTable() . '.tenant_id', $tenantContext->getTenantId());
        }
    }
}
