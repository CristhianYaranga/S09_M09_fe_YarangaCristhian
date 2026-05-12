export interface Contacto {
  id?: number;
  nombre: string;
  email: string;
  telefono: string;
  asunto: string;
  mensaje: string;
  fechaEnvio?: string;
  estado?: string;  // 'Nuevo', 'En revisión', 'Respondido'
}
