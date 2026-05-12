export interface Reserva {
  id?: number;
  nombreCliente: string;
  email: string;
  destino: string;
  fechaViaje: string;       // formato: 'YYYY-MM-DD'
  fechaRegreso: string;
  numPersonas: number;
  precioTotal: number;
  estado: string;
}