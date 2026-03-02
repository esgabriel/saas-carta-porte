import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Truck, Navigation } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Catalogos() {
    return (
        <div className="pb-8">
            <h1 className="text-2xl font-bold mb-2">Catálogos del Sistema</h1>
            <p className="text-sm text-muted-foreground mb-6">Administra las entidades requeridas para tus viajes.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Enlace al Catálogo de Clientes */}
                <Link to="/catalogos/clientes" className="block active:scale-[0.98] transition-all">
                    <Card className="hover:border-primary/50 transition-colors h-full">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-lg">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Clientes</CardTitle>
                                <CardDescription className="mt-1">
                                    Gestiona destinatarios y remitentes
                                </CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                </Link>

                {/* Placeholder para los próximos catálogos */}
                <Card className="opacity-60 cursor-not-allowed">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="bg-muted p-3 rounded-lg">
                            <Truck className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Vehículos & Remolques</CardTitle>
                            <CardDescription className="mt-1">
                                Próximamente
                            </CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}
