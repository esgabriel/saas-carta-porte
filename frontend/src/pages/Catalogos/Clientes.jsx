import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import {
    Plus, Mail, Phone, Building2,
    Trash2, Pencil, RotateCcw, AlertTriangle,
} from "lucide-react";

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

const EMPTY_FORM = {
    nombre_razon_social: "",
    rfc: "",
    regimen_fiscal: "",
    uso_cfdi: "",
    correo: "",
    telefono: "",
    codigo_postal: "",
};

// Estado de confirmación por card:
//   null                        → normal
//   { step: 'confirm' }         → "¿Seguro?" antes de llamar al API
//   { step: 'conflict', msg, count } → 409: ofrece desactivar
//   { step: 'loading' }         → esperando respuesta del API
const IDLE = null;

export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingCliente, setEditingCliente] = useState(null); // null = crear
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    // Map<clienteId, estado-de-confirmacion>
    const [deleteState, setDeleteState] = useState({});

    // -------------------------------------------------------------------------
    // Data
    // -------------------------------------------------------------------------

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

    useEffect(() => { fetchClientes(); }, []);

    // -------------------------------------------------------------------------
    // Drawer helpers
    // -------------------------------------------------------------------------

    const openCreate = () => {
        setEditingCliente(null);
        setFormData(EMPTY_FORM);
        setIsDrawerOpen(true);
    };

    const openEdit = (cliente) => {
        setEditingCliente(cliente);
        setFormData({
            nombre_razon_social: cliente.nombre_razon_social ?? "",
            rfc: cliente.rfc ?? "",
            regimen_fiscal: cliente.regimen_fiscal ?? "",
            uso_cfdi: cliente.uso_cfdi ?? "",
            correo: cliente.correo ?? "",
            telefono: cliente.telefono ?? "",
            codigo_postal: cliente.codigo_postal ?? "",
        });
        setIsDrawerOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingCliente) {
                await api.patch(`/clientes/${editingCliente.id}`, formData);
            } else {
                await api.post("/clientes", formData);
            }
            setIsDrawerOpen(false);
            fetchClientes();
        } catch (error) {
            const msg = error.response?.data?.message
                || JSON.stringify(error.response?.data?.errors)
                || error.message;
            console.error("Error al guardar cliente:", error.response?.data || error.message);
            alert('Error al guardar: ' + msg);
        } finally {
            setSaving(false);
        }
    };

    // -------------------------------------------------------------------------
    // Delete / Deactivate flow
    // -------------------------------------------------------------------------

    const setCardState = (id, state) =>
        setDeleteState((prev) => ({ ...prev, [id]: state }));

    // Paso 1: primer click en 🗑
    const handleDeleteClick = (id) => {
        setCardState(id, { step: "confirm" });
    };

    // Paso 2: el usuario confirmó — llamamos al API
    const handleDeleteConfirm = async (id) => {
        setCardState(id, { step: "loading" });
        try {
            await api.delete(`/clientes/${id}`);
            // Éxito: sacamos el registro de la lista inmediatamente (optimistic)
            setClientes((prev) => prev.filter((c) => c.id !== id));
            setCardState(id, IDLE);
        } catch (error) {
            if (error.response?.status === 409) {
                const { message, viajes_count } = error.response.data;
                setCardState(id, { step: "conflict", message, count: viajes_count });
            } else {
                // Error inesperado: reseteamos
                console.error("Error eliminando cliente:", error);
                setCardState(id, IDLE);
            }
        }
    };

    // Paso 3a (conflict): el usuario elige desactivar
    const handleDeactivate = async (id) => {
        setCardState(id, { step: "loading" });
        try {
            await api.patch(`/clientes/${id}`, { activo: false });
            // Actualizamos el registro en el estado local
            setClientes((prev) =>
                prev.map((c) => (c.id === id ? { ...c, activo: false } : c))
            );
        } catch (error) {
            console.error("Error desactivando cliente:", error);
        } finally {
            setCardState(id, IDLE);
        }
    };

    const handleReactivate = async (id) => {
        try {
            await api.patch(`/clientes/${id}`, { activo: true });
            setClientes((prev) =>
                prev.map((c) => (c.id === id ? { ...c, activo: true } : c))
            );
        } catch (error) {
            console.error("Error reactivando cliente:", error);
        }
    };

    const cancelDelete = (id) => setCardState(id, IDLE);

    // -------------------------------------------------------------------------
    // Render helpers
    // -------------------------------------------------------------------------

    const renderCardActions = (cliente) => {
        const ds = deleteState[cliente.id];

        if (!ds) {
            // Estado normal: botones Editar y Eliminar
            return (
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(cliente)}
                        title="Editar cliente"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    {cliente.activo !== false ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive opacity-70 hover:opacity-100 hover:bg-destructive/10"
                            onClick={() => handleDeleteClick(cliente.id)}
                            title="Eliminar cliente"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:bg-green-50"
                            onClick={() => handleReactivate(cliente.id)}
                            title="Reactivar cliente"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            );
        }

        if (ds.step === "loading") {
            return (
                <div className="h-8 w-8 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-muted-foreground" />
                </div>
            );
        }

        if (ds.step === "confirm") {
            return (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">¿Eliminar?</span>
                    <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleDeleteConfirm(cliente.id)}
                    >
                        Sí
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => cancelDelete(cliente.id)}
                    >
                        No
                    </Button>
                </div>
            );
        }

        return null; // el conflict se renderiza abajo en la card
    };

    // -------------------------------------------------------------------------
    // JSX
    // -------------------------------------------------------------------------

    return (
        <div className="pb-24">
            <h1 className="text-2xl font-bold mb-6">Directorio de Clientes</h1>

            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            ) : clientes.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                    No tienes clientes registrados en este tenant.
                </div>
            ) : (
                <div className="grid gap-4">
                    {clientes.map((cliente) => {
                        const ds = deleteState[cliente.id];
                        const isInactive = cliente.activo === false;
                        const isConflict = ds?.step === "conflict";

                        return (
                            <Card
                                key={cliente.id}
                                className={`overflow-hidden shadow-sm transition-all ${isInactive ? "opacity-50" : "active:scale-[0.98]"
                                    }`}
                            >
                                <CardContent className="p-4">
                                    {/* Cabecera: nombre + acciones */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-lg font-bold leading-tight break-words pr-2">
                                                {cliente.nombre_razon_social}
                                            </h2>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <span className="inline-block px-2 py-0.5 bg-muted text-muted-foreground text-xs font-mono rounded">
                                                    {cliente.rfc}
                                                </span>
                                                {isInactive && (
                                                    <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {renderCardActions(cliente)}
                                    </div>

                                    {/* Info adicional */}
                                    <div className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
                                        {cliente.correo && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 shrink-0" />
                                                <span className="truncate">{cliente.correo}</span>
                                            </div>
                                        )}
                                        {cliente.telefono && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 shrink-0" />
                                                <span>{cliente.telefono}</span>
                                            </div>
                                        )}
                                        {cliente.regimen_fiscal && (
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 shrink-0" />
                                                <span>Régimen: {cliente.regimen_fiscal}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Banner de conflicto (409) */}
                                    {isConflict && (
                                        <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 animate-in fade-in slide-in-from-bottom-2">
                                            <div className="flex items-start gap-2 mb-3">
                                                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                                <p className="text-xs text-amber-800 leading-snug">
                                                    {ds.message}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="h-8 px-3 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                                                    onClick={() => handleDeactivate(cliente.id)}
                                                >
                                                    Desactivar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 px-3 text-xs"
                                                    onClick={() => cancelDelete(cliente.id)}
                                                >
                                                    Cancelar
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* FAB + Drawer (crear / editar) */}
            <div className="fixed bottom-6 right-6 z-40 md:static md:mt-8 md:flex md:justify-end">
                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <DrawerTrigger asChild>
                        <Button
                            size="icon"
                            className="h-14 w-14 rounded-full shadow-lg md:w-auto md:h-11 md:px-6 md:rounded-md"
                            onClick={openCreate}
                        >
                            <Plus className="h-6 w-6 md:mr-2" />
                            <span className="hidden md:inline font-semibold">Nuevo Cliente</span>
                        </Button>
                    </DrawerTrigger>

                    <DrawerContent className="max-h-[90vh]">
                        <DrawerHeader className="text-left">
                            <DrawerTitle className="text-xl">
                                {editingCliente ? "Editar Cliente" : "Añadir Cliente"}
                            </DrawerTitle>
                            <DrawerDescription>
                                {editingCliente
                                    ? "Modifica los datos del cliente y guarda los cambios."
                                    : "Rellena los siguientes datos para registrar un cliente en tu catálogo."}
                            </DrawerDescription>
                        </DrawerHeader>

                        <form
                            id="clienteForm"
                            onSubmit={handleSubmit}
                            className="p-4 flex flex-col gap-4 overflow-y-auto"
                        >
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
                            <div className="space-y-2">
                                <Label htmlFor="codigo_postal">Código Postal</Label>
                                <Input
                                    id="codigo_postal"
                                    name="codigo_postal"
                                    type="text"
                                    placeholder="06600"
                                    maxLength={5}
                                    value={formData.codigo_postal}
                                    onChange={handleChange}
                                    required
                                    className="h-12"
                                />
                            </div>
                        </form>

                        <DrawerFooter className="pt-2">
                            <Button
                                type="submit"
                                form="clienteForm"
                                className="h-12 text-lg"
                                disabled={saving}
                            >
                                {saving
                                    ? "Guardando…"
                                    : editingCliente
                                        ? "Guardar Cambios"
                                        : "Guardar Cliente"}
                            </Button>
                            <DrawerClose asChild>
                                <Button variant="outline" className="h-12">
                                    Cancelar
                                </Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>
        </div>
    );
}