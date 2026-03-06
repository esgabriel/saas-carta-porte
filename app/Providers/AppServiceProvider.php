<?php

namespace App\Providers;

use App\Services\TenantContext;
use App\Services\FacturapiService;
use App\Contracts\FacturacionGatewayInterface;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // TenantContext vive como singleton durante toda la petición:
        // TenantMiddleware escribe el tenant_id y TenantScope lo lee.
        $this->app->singleton(TenantContext::class , fn() => new TenantContext());

        // Binding para Clean Architecture
        $this->app->bind(FacturacionGatewayInterface::class, FacturapiService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
    //
    }
}
