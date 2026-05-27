export const VEHICULO_ESTADOS = [
  'DISPONIBLE',
  'ALQUILADO',
  'MANTENIMIENTO',
  'INACTIVO',
] as const;

export type VehiculoEstado = (typeof VEHICULO_ESTADOS)[number];

export const TRANSMISIONES = ['MANUAL', 'AUTOMATICA'] as const;
export type TransmisionVehiculo = (typeof TRANSMISIONES)[number];

export const COMBUSTIBLES = [
  'GASOLINA',
  'DIESEL',
  'ELECTRICO',
  'HIBRIDO',
  'GLP/GNV',
] as const;
export type CombustibleVehiculo = (typeof COMBUSTIBLES)[number];

export const ESTADO_LABELS: Record<VehiculoEstado, string> = {
  DISPONIBLE: 'Disponible',
  ALQUILADO: 'Alquilado',
  MANTENIMIENTO: 'Mantenimiento',
  INACTIVO: 'Inactivo',
};
