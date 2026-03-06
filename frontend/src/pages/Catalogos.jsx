import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Truck, UserCheck, MapPin, Layers } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const ITEMS = [
    { to: '/catalogos/clientes', Icon: Users, title: 'Clientes', desc: 'Receptores del CFDI' },
    { to: '/catalogos/ubicaciones', Icon: MapPin, title: 'Ubicaciones', desc: 'Orígenes y destinos' },
    { to: '/catalogos/operadores', Icon: UserCheck, title: 'Operadores', desc: 'Conductores con licencia' },
    { to: '/catalogos/vehiculos', Icon: Truck, title: 'Vehículos', desc: 'Unidades y sus seguros' },
    { to: '/catalogos/remolques', Icon: Layers, title: 'Remolques', desc: 'Cajas y plataformas' },
];

export default function Catalogos() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-1">Catálogos</h1>
            <p className="text-sm text-muted-foreground mb-6">
                Registra los datos necesarios antes de crear un viaje.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ITEMS.map(({ to, Icon, title, desc }) => (
                    <Link key={to} to={to} className="block active:scale-[0.98] transition-transform">
                        <Card className="hover:border-primary/50 transition-colors h-full">
                            <CardHeader className="flex flex-row items-center gap-4 py-4">
                                <div className="bg-primary/10 p-3 rounded-lg shrink-0">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">{title}</CardTitle>
                                    <CardDescription className="text-xs mt-0.5">{desc}</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}