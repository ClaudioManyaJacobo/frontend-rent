import { User } from './user/user.model';
import { Sucursal } from './admin/branch.model';
import { Empresa } from './admin/company.model';

export interface EmpleadoSucursal {
  id: string;
  empleado_id: string;
  sucursal_id: string;
  empresa_id: string;
  cargo: string | null;
  fecha_asignacion: string;
  fecha_terminacion: string | null;
  esta_activo: boolean;
  empleado?: User;
  sucursal?: Sucursal;
  empresa?: Empresa;
}

export interface CreateEmpleadoSucursalRequest {
  empleado_id: string;
  sucursal_id: string;
  empresa_id: string;
  cargo: string;
}

export type UpdateEmpleadoSucursalRequest = Partial<CreateEmpleadoSucursalRequest>;
