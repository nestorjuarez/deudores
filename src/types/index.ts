export interface Deudor {
  id: string;
  dni: string;
  nombre: string;
  apellido: string;
}

export interface Deuda {
  id: string;
  monto: number;
  descripcion: string;
  deudor: Deudor;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
}
