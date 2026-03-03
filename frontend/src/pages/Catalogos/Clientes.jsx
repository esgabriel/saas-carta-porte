import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Plus, User, Mail, Phone, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";

export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        nombre_razon_social: "",
        rfc: "",
        regimen_fiscal: "",
        uso_cfdi: "",
        correo: "",
        telefono: "",
    });

    const fetchClientes = async () => {
        try {
            setLoading(true);
            const response = await api.get("/clientes");
            setClientes(response.data.data);
        } catch (error) {
            console.error("Error cargando clientes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/clientes", formData);
            setIsOpen(false);
            setFormData({
                nombre_razon_social: "",
                rfc: "",
                regimen_fiscal: "",
                uso_cfdi: "",
                correo: "",
                telefono: "",
            });
            fetchClientes(); // Refrescar lista
        } catch (error) {
            console.error("Error al guardar cliente:", error.response?.data || error.message);
            // Aqui podrías manejar un Toast para mostrar el error al usuario
        }
    };

    return (
        <div className="pb-24"> {/* Extra padding bottom for FAB */}
            <h1 className="text-2xl font-bold mb-6">Directorio de Clientes</h1>

            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : clientes.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                    No tienes clientes registrados en este tenant.
                </div>
            ) : (
                <div className="grid gap-4">
                    {clientes.map((cliente) => (
                        <Card key={cliente.id} className="overflow-hidden shadow-sm active:scale-[0.98] transition-all">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h2 className="text-lg font-bold leading-tight break-words pr-2">
                                            {cliente.nombre_razon_social}
                                        </h2>
                                        <span className="inline-block px-2 py-0.5 mt-1 bg-muted text-muted-foreground text-xs font-mono rounded">
                                            {cliente.rfc}
                                        </span>
                                    </div>
                                </div>

                                {/* Info adicional para contexto móvil rápido */}
                                <div className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
                                    {cliente.correo && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            <span className="truncate">{cliente.correo}</span>
                                        </div>
                                    )}
                                    {cliente.telefono && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            <span>{cliente.telefono}</span>
                                        </div>
                                    )}
                                    {cliente.regimen_fiscal && (
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            <span>Regimen: {cliente.regimen_fiscal}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Floating Action Button (FAB) Mobile nativo */}
            <div className="fixed bottom-6 right-6 z-40 md:static md:mt-8 md:flex md:justify-end">
                <Drawer open={isOpen} onOpenChange={setIsOpen}>
                    <DrawerTrigger asChild>
                        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg md:w-auto md:h-11 md:px-6 md:rounded-md">
                            <Plus className="h-6 w-6 md:mr-2" />
                            <span className="hidden md:inline font-semibold">Nuevo Cliente</span>
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent className="max-h-[90vh]">
                        <DrawerHeader className="text-left">
                            <DrawerTitle className="text-xl">Añadir Cliente</DrawerTitle>
                            <DrawerDescription>
                                Rellena los siguientes datos para registrar un cliente en tu catálogo.
                            </DrawerDescription>
                        </DrawerHeader>
                        <form id="clienteForm" onSubmit={handleSubmit} className="p-4 flex flex-col gap-4 overflow-y-auto">
                            <div className="space-y-2">
                                <Label htmlFor="nombre_razon_social">Razón Social *</Label>
                                <Input
                                    id="nombre_razon_social"
                                    name="nombre_razon_social"
                                    placeholder="Ej. Transportes del Norte SA"
                                    value={formData.nombre_razon_social}
                                    onChange={handleChange}
                                    required
                                    className="h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rfc">RFC *</Label>
                                <Input
                                    id="rfc"
                                    name="rfc"
                                    placeholder="XAXX010101000"
                                    value={formData.rfc}
                                    onChange={handleChange}
                                    required
                                    className="h-12 uppercase font-mono"
                                    maxLength={13}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="regimen_fiscal">Régimen Fiscal (Clave SAT) *</Label>
                                <Input
                                    id="regimen_fiscal"
                                    name="regimen_fiscal"
                                    placeholder="Ej. 601"
                                    value={formData.regimen_fiscal}
                                    onChange={handleChange}
                                    required
                                    className="h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="uso_cfdi">Uso CFDI (Clave SAT) *</Label>
                                <Input
                                    id="uso_cfdi"
                                    name="uso_cfdi"
                                    placeholder="Ej. G03"
                                    value={formData.uso_cfdi}
                                    onChange={handleChange}
                                    required
                                    className="h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="correo">Correo Electrónico *</Label>
                                <Input
                                    id="correo"
                                    name="correo"
                                    type="email"
                                    placeholder="contacto@empresa.com"
                                    value={formData.correo}
                                    onChange={handleChange}
                                    required
                                    className="h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telefono">Teléfono</Label>
                                <Input
                                    id="telefono"
                                    name="telefono"
                                    type="tel"
                                    placeholder="5551234567"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    className="h-12"
                                />
                            </div>
                        </form>
                        <DrawerFooter className="pt-2">
                            <Button type="submit" form="clienteForm" className="h-12 text-lg">Guardar Cliente</Button>
                            <DrawerClose asChild>
                                <Button variant="outline" className="h-12">Cancelar</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>
        </div>
    );
}
