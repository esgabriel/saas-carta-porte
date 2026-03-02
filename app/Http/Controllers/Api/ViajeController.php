<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreViajeRequest;
use App\Http\Requests\Api\UpdateViajeRequest;
use App\Models\Viaje;
use App\Services\TenantContext;
use Illuminate\Support\Facades\DB;

class ViajeController extends Controller
{
    protected string $tenantId;

    public function __construct(TenantContext $tenantContext)
    {
        $this->tenantId = $tenantContext->getTenantId();
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Eager loading de todas las relaciones de interés
        $viajes = Viaje::with([
            'cliente',
            'vehiculo',
            'operador',
            'remolque',
            'ubicacionOrigen',
            'ubicacionDestino',
            'mercancias'
        ])->get();

        return response()->json(['data' => $viajes]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreViajeRequest $request)
    {
        $validated = $request->validated();

        $viajeArray = $validated;
        unset($viajeArray['mercancias']);
        $viajeArray['tenant_id'] = $this->tenantId;

        $mercanciasArray = $validated['mercancias'];

        // Envuelve la creación en una transacción de BD para atomicidad
        $viaje = DB::transaction(function () use ($viajeArray, $mercanciasArray) {

            $nuevoViaje = Viaje::create($viajeArray);

            $mercanciasParaInsertar = array_map(function ($mercancia) {
                    // Inyectamos el tenant_id en cada mercancía
                    $mercancia['tenant_id'] = $this->tenantId;
                    return $mercancia;
                }
                    , $mercanciasArray);

                $nuevoViaje->mercancias()->createMany($mercanciasParaInsertar);

                return $nuevoViaje;
            });

        // Cargamos las relaciones para devolver el objeto completo
        $viaje->load([
            'cliente',
            'vehiculo',
            'operador',
            'remolque',
            'ubicacionOrigen',
            'ubicacionDestino',
            'mercancias'
        ]);

        return response()->json([
            'message' => 'Viaje y mercancías creados correctamente.',
            'data' => $viaje
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Viaje $viaje)
    {
        $viaje->load([
            'cliente',
            'vehiculo',
            'operador',
            'remolque',
            'ubicacionOrigen',
            'ubicacionDestino',
            'mercancias'
        ]);

        return response()->json(['data' => $viaje]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateViajeRequest $request, Viaje $viaje)
    {
        $validated = $request->validated();

        $viajeArray = $validated;
        unset($viajeArray['mercancias']);

        DB::transaction(function () use ($viaje, $viajeArray, $validated) {

            $viaje->update($viajeArray);

            // Si se envían mercancías en el update, la estrategia típica REST es reemplazarlas
            if (isset($validated['mercancias'])) {
                // Borramos mercancias actuales
                $viaje->mercancias()->delete();

                $mercanciasParaInsertar = array_map(function ($mercancia) {
                            $mercancia['tenant_id'] = $this->tenantId;
                            return $mercancia;
                        }
                            , $validated['mercancias']);

                        $viaje->mercancias()->createMany($mercanciasParaInsertar);
                    }
                });

        $viaje->refresh()->load([
            'cliente',
            'vehiculo',
            'operador',
            'remolque',
            'ubicacionOrigen',
            'ubicacionDestino',
            'mercancias'
        ]);

        return response()->json([
            'message' => 'Viaje actualizado correctamente.',
            'data' => $viaje
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Viaje $viaje)
    {
        // Las mercancias se podrian borrar por cascade en BD, 
        // pero preferimos eliminarlas con Eloquent primero por safety en caso no exista el cascade.
        DB::transaction(function () use ($viaje) {
            $viaje->mercancias()->delete();
            $viaje->delete();
        });

        return response()->json([
            'message' => 'Viaje eliminado correctamente.'
        ], 204);
    }
}
