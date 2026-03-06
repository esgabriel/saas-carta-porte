import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Drawer, DrawerClose, DrawerContent, DrawerDescription,
    DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,
} from '@/components/ui/drawer';

const INITIAL = { placa: '', subtipo_rem: '' };

export default function Remolques() {
    const [remolques, setRemolques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState(INITIAL);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const res = await api.get('/remolques');
            setRemolques(res.data.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await api.post('/remolques', form);
            setIsOpen(false);
            setForm(INITIAL);
            fetchAll();
        } catch (e) { console.error(e.response?.data || e.message); }
    };

    return (
        <div className="pb-24">
            <h1 className="text-2xl font-bold mb-6">Remolques</h1>

            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            ) : remolques.length === 0 ? (
                <p className="text-center p-8 text-muted-foreground">Sin remolques registrados.</p>
            ) : (
                <div className="grid gap-3">
                    {remolques.map(r => (
                        <Card key={r.id}>
                            <CardContent className="p-4">
                                <p className="font-semibold font-mono">{r.placa}</p>
                                <p className="text-sm text-muted-foreground">Subtipo: {r.subtipo_rem}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="fixed bottom-6 right-6 z-40 md:static md:mt-8 md:flex md:justify-end">
                <Drawer open={isOpen} onOpenChange={setIsOpen}>
                    <DrawerTrigger asChild>
                        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg md:w-auto md:h-11 md:px-6 md:rounded-md">
                            <Plus className="h-6 w-6 md:mr-2" />
                            <span className="hidden md:inline font-semibold">Nuevo Remolque</span>
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader className="text-left">
                            <DrawerTitle className="text-xl">Nuevo Remolque</DrawerTitle>
                            <DrawerDescription>Caja o plataforma del vehículo articulado.</DrawerDescription>
                        </DrawerHeader>
                        <form id="remolqueForm" onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
                            <div className="space-y-2">
                                <Label>Placa *</Label>
                                <Input name="placa" placeholder="XYZ-7890" value={form.placa} onChange={handleChange}
                                    required className="h-12 font-mono uppercase" />
                            </div>
                            <div className="space-y-2">
                                <Label>Subtipo (clave SAT) *</Label>
                                <Input name="subtipo_rem" placeholder="CTR001" value={form.subtipo_rem} onChange={handleChange}
                                    required className="h-12" maxLength={10} />
                            </div>
                        </form>
                        <DrawerFooter>
                            <Button type="submit" form="remolqueForm" className="h-12 text-base font-semibold">Guardar Remolque</Button>
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