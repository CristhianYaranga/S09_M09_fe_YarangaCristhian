import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Reserva } from './reservas.model';
import { ReservaService } from './reservas.service';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css'
})
export class ReservasComponent implements OnInit {
 
  reservas: Reserva[] = [];
  modoFormulario = false;
  editando = false;
  cargando = false;
  mensaje = '';
  tipoMensaje = '';   // 'success' | 'error'
 
  // Modelo del formulario
  reservaActual: Reserva = this.nuevaReserva();
 
  constructor(
    private reservaService: ReservaService,
    private router: Router
  ) {}
 
  ngOnInit(): void {
    this.cargarReservas();
  }
 
  // ── Cargar lista ─────────────────────────────
  cargarReservas(): void {
    this.cargando = true;
    this.reservaService.listar().subscribe({
      next: (data: Reserva[]) => { this.reservas = data; this.cargando = false; },
      error: () => { this.mostrarMensaje('Error al cargar reservas', 'error'); this.cargando = false; }
    });
  }
 
  // ── Abrir formulario nuevo ───────────────────
  abrirFormularioNuevo(): void {
    this.reservaActual = this.nuevaReserva();
    this.editando = false;
    this.modoFormulario = true;
  }
 
  // ── Abrir formulario editar ──────────────────
  editarReserva(reserva: Reserva): void {
    this.reservaActual = { ...reserva };  // copia para no mutar la lista
    this.editando = true;
    this.modoFormulario = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
 
  // ── Guardar (crear o actualizar) ─────────────
  guardar(): void {
    if (this.editando && this.reservaActual.id) {
      this.reservaService.actualizar(this.reservaActual.id, this.reservaActual).subscribe({
        next: () => {
          this.mostrarMensaje('Reserva actualizada correctamente ✅', 'success');
          this.cancelar();
          this.cargarReservas();
        },
        error: () => this.mostrarMensaje('Error al actualizar la reserva', 'error')
      });
    } else {
      this.reservaService.crear(this.reservaActual).subscribe({
        next: () => {
          this.mostrarMensaje('Reserva creada correctamente ✅', 'success');
          this.cancelar();
          this.cargarReservas();
        },
        error: () => this.mostrarMensaje('Error al crear la reserva', 'error')
      });
    }
  }
 
  // ── Eliminar ─────────────────────────────────
  eliminarReserva(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
      this.reservaService.eliminar(id).subscribe({
        next: () => {
          this.mostrarMensaje('Reserva eliminada', 'success');
          this.cargarReservas();
        },
        error: () => this.mostrarMensaje('Error al eliminar la reserva', 'error')
      });
    }
  }
 
  // ── Cancelar formulario ──────────────────────
  cancelar(): void {
    this.modoFormulario = false;
    this.editando = false;
    this.reservaActual = this.nuevaReserva();
  }
 
  // ── Volver a la Landing ──────────────────────
  volverALanding(): void {
    this.router.navigate(['/']);
  }
 
  // ── Helpers ──────────────────────────────────
  private nuevaReserva(): Reserva {
    return {
      nombreCliente: '',
      email: '',
      destino: '',
      fechaViaje: '',
      fechaRegreso: '',
      numPersonas: 1,
      precioTotal: 0,
      estado: 'Pendiente'
    };
  }
 
  private mostrarMensaje(texto: string, tipo: string): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => { this.mensaje = ''; }, 3500);
  }
 
  badgeClass(estado: string): string {
    const map: { [key: string]: string } = {
      'Confirmada': 'badge-success',
      'Pendiente':  'badge-warning',
      'Cancelada':  'badge-danger'
    };
    return map[estado] ?? 'badge-secondary';
  }
}