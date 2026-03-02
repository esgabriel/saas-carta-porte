<?php

namespace App\Services;

class TenantContext
{
    private ?string $tenantId = null;

    /**
     * Establece el tenant activo para la petición/contexto actual.
     */
    public function setTenantId(string $tenantId): void
    {
        $this->tenantId = $tenantId;
    }

    /**
     * Retorna el tenant_id activo, o null si no se ha establecido ninguno.
     */
    public function getTenantId(): ?string
    {
        return $this->tenantId;
    }

    /**
     * Limpia el tenant activo (útil para pruebas unitarias y jobs).
     */
    public function clear(): void
    {
        $this->tenantId = null;
    }
}
