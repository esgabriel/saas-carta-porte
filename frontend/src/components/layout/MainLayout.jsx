import React from "react";
import { Link, Outlet } from "react-router-dom";
import { Menu, Home, Truck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Topbar: Fixed at top, mobile-first design */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center justify-between px-4">
                    <div className="flex items-center gap-2">

                        {/* Mobile Nav Trigger mapped to Sheet */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-12 w-12 md:hidden">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Toggle Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[80vw] sm:w-[350px]">
                                <SheetHeader className="text-left pb-4 border-b">
                                    <SheetTitle className="text-xl font-bold">Menu</SheetTitle>
                                </SheetHeader>
                                <nav className="flex flex-col gap-2 mt-4">
                                    <Link to="/" className="flex items-center gap-3 px-3 py-4 hover:bg-muted rounded-md text-lg">
                                        <Home className="h-6 w-6" />
                                        Inicio
                                    </Link>
                                    <Link to="/viajes" className="flex items-center gap-3 px-3 py-4 hover:bg-muted rounded-md text-lg">
                                        <Truck className="h-6 w-6" />
                                        Viajes
                                    </Link>
                                    <Link to="/catalogos" className="flex items-center gap-3 px-3 py-4 hover:bg-muted rounded-md text-lg">
                                        <Users className="h-6 w-6" />
                                        Catálogos
                                    </Link>
                                </nav>
                            </SheetContent>
                        </Sheet>

                        {/* Brand Logo/Title */}
                        <Link to="/" className="font-bold text-lg md:text-xl md:ml-4 tracking-tight">
                            Transport SaaS
                        </Link>
                    </div>

                    {/* Desktop Nav - Hidden on mobile */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link to="/viajes" className="text-sm font-medium transition-colors hover:text-primary">Viajes</Link>
                        <Link to="/catalogos" className="text-sm font-medium transition-colors hover:text-primary">Catálogos</Link>
                    </nav>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto container px-4 py-6 md:p-8">
                <Outlet />
            </main>
        </div>
    );
}
