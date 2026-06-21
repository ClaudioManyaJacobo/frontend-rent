import { Alquiler } from '../../../shared/models/alquiler.model';

export interface DashboardStats {
  counts: {
    empresas: number;
    sucursales: number;
    vehiculos: number;
    alquileres: number;
    usuarios: number;
    clientes: number;
  };
  alquileresPorEstado: { estado: string; count: number }[];
  vehiculosPorEstado: { estado: string; count: number }[];
  vehiculosPorCategoria: { categoria: string; count: number }[];
  alquileresPorCategoria: { categoria: string; count: number }[];
  ingresosDelMes: number;
  alquileresRecientes: Alquiler[];
}
