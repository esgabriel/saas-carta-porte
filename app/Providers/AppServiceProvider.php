<?php

namespace App\Providers;

use App\Services\TenantContext;
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
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
    //
    }
}
