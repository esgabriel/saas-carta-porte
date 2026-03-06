import axios from "axios";

// Instancia pre-configurada para apuntar a la API de Laravel
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost/api",
    timeout: 10000,
});

// Interceptor para inyectar automáticamente configuraciones de cabecera
api.interceptors.request.use(
    (config) => {
        config.headers["Accept"] = "application/json";
        config.headers["Content-Type"] = "application/json";

        // Este UUID será dinámico después del sistema de Auth / Selección de Tenant
        config.headers["X-Tenant-ID"] = "70d298b8-a678-4382-ae96-fce6058d90be";

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
