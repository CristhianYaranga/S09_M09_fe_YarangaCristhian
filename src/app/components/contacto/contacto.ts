import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Contacto } from './contacto.model';
import { ContactoService } from './contacto.service';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css'
})
export class ContactoComponent implements OnInit {
  
  contactos: Contacto[] = [];
  modoFormulario = false;
  modoListado = false;
  editando = false;
  cargando = false;
  mensaje = '';
  tipoMensaje = ''; // 'success' | 'error'
  
  // 🔧 INICIALIZAR DIRECTAMENTE (NO LLAMAR MÉTODO)
  contactoActual: Contacto = {
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: '',
    estado: 'Nuevo'
  };
  
  constructor(
    private contactoService: ContactoService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // No cargar por defecto
  }
  
  // ── Cambiar a modo listado
  verListado(): void {
    this.modoListado = true;
    this.modoFormulario = false;
    this.cargarContactos();
  }
  
  // ── Cargar lista
  cargarContactos(): void {
    this.cargando = true;
    this.contactoService.listar().subscribe({
      next: (data: Contacto[]) => {
        this.contactos = data;
        this.cargando = false;
      },
      error: () => {
        this.mostrarMensaje('Error al cargar contactos', 'error');
        this.cargando = false;
      }
    });
  }
  
  // ── Abrir formulario nuevo
  abrirFormularioNuevo(): void {
    this.contactoActual = {
      nombre: '',
      email: '',
      telefono: '',
      asunto: '',
      mensaje: '',
      estado: 'Nuevo'
    };
    this.editando = false;
    this.modoFormulario = true;
    this.modoListado = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // ── Abrir formulario editar
  editarContacto(contacto: Contacto): void {
    this.contactoActual = { ...contacto };
    this.editando = true;
    this.modoFormulario = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // ── GUARDAR CON VALIDACIONES FUERTES Y LOGS
  guardar(): void {
    console.log('=== INICIANDO GUARDAR ===');
    console.log('contactoActual antes:', {
      nombre: this.contactoActual.nombre,
      email: this.contactoActual.email,
      telefono: this.contactoActual.telefono,
      asunto: this.contactoActual.asunto,
      mensaje: this.contactoActual.mensaje
    });

    // 🔴 VALIDACIONES INICIALES
    const errores = this.validarFormulario();
    if (errores.length > 0) {
      console.error('❌ Errores de validación:', errores);
      this.mostrarMensaje('❌ ' + errores[0], 'error');
      return;
    }

    console.log('✅ Validaciones pasadas');

    // 🟢 LIMPIAR Y PREPARAR DATOS
    const datosLimpios = this.prepararDatos();
    console.log('Datos limpios a enviar:', datosLimpios);

    if (this.editando && this.contactoActual.id) {
      console.log('Modo: ACTUALIZAR');
      this.contactoService.actualizar(this.contactoActual.id, datosLimpios).subscribe({
        next: () => {
          this.mostrarMensaje('✅ Mensaje actualizado correctamente', 'success');
          this.cancelar();
          this.cargarContactos();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          const msgError = err.error?.errores 
            ? Object.values(err.error.errores)[0] 
            : 'Error al actualizar. Revisa los datos.';
          this.mostrarMensaje('❌ ' + msgError, 'error');
        }
      });
    } else {
      console.log('Modo: CREAR');
      this.contactoService.crear(datosLimpios).subscribe({
        next: (respuesta) => {
          console.log('✅ Respuesta del servidor:', respuesta);
          this.mostrarMensaje('✅ ¡Mensaje enviado correctamente! Nos pondremos en contacto pronto.', 'success');
          this.cancelar();
        },
        error: (err) => {
          console.error('Error al crear:', err);
          console.error('Respuesta del servidor:', err.error);
          const msgError = err.error?.errores 
            ? Object.values(err.error.errores)[0] 
            : 'Error al enviar. Revisa que todos los datos sean válidos.';
          this.mostrarMensaje('❌ ' + msgError, 'error');
        }
      });
    }
  }

  // 🔍 VALIDAR FORMULARIO ANTES DE ENVIAR
  private validarFormulario(): string[] {
    const errores: string[] = [];

    // ✓ NOMBRE
    const nombre = (this.contactoActual.nombre || '').trim();
    if (!nombre) {
      errores.push('El nombre es obligatorio');
    } else if (nombre.length < 3) {
      errores.push('El nombre debe tener mínimo 3 caracteres');
    } else if (nombre.length > 100) {
      errores.push('El nombre debe tener máximo 100 caracteres');
    }

    // ✓ EMAIL
    const email = (this.contactoActual.email || '').trim();
    if (!email) {
      errores.push('El email es obligatorio');
    } else if (!this.esEmailValido(email)) {
      errores.push('El email debe ser válido (ejemplo: usuario@dominio.com)');
    } else if (email.length > 100) {
      errores.push('El email debe tener máximo 100 caracteres');
    }

    // ✓ TELÉFONO
    const telefono = (this.contactoActual.telefono || '').trim();
    const soloNumeros = telefono.replace(/\D/g, '');
    if (!telefono) {
      errores.push('El teléfono es obligatorio');
    } else if (!/^\d+$/.test(telefono)) {
      errores.push('El teléfono solo debe contener números (sin espacios ni caracteres especiales)');
    } else if (soloNumeros.length < 9) {
      errores.push('El teléfono debe tener mínimo 9 dígitos');
    } else if (soloNumeros.length > 20) {
      errores.push('El teléfono debe tener máximo 20 dígitos');
    }

    // ✓ ASUNTO
    const asunto = (this.contactoActual.asunto || '').trim();
    if (!asunto) {
      errores.push('El asunto es obligatorio');
    } else if (asunto.length > 100) {
      errores.push('El asunto debe tener máximo 100 caracteres');
    }

    // ✓ MENSAJE
    const mensaje = (this.contactoActual.mensaje || '').trim();
    if (!mensaje) {
      errores.push('El mensaje es obligatorio');
    } else if (mensaje.length < 10) {
      errores.push('El mensaje debe tener mínimo 10 caracteres');
    } else if (mensaje.length > 500) {
      errores.push('El mensaje debe tener máximo 500 caracteres');
    }

    return errores;
  }

  // 🧹 PREPARAR DATOS (LIMPIAR)
  private prepararDatos(): Contacto {
    return {
      nombre: (this.contactoActual.nombre || '').trim(),
      email: (this.contactoActual.email || '').trim(),
      telefono: (this.contactoActual.telefono || '').trim().replace(/\D/g, ''),
      asunto: (this.contactoActual.asunto || '').trim(),
      mensaje: (this.contactoActual.mensaje || '').trim(),
      estado: this.contactoActual.estado || 'Nuevo'
    };
  }

  // ✉️ VALIDAR EMAIL
  private esEmailValido(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  // ── Eliminar
  eliminarContacto(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este contacto?')) {
      this.contactoService.eliminar(id).subscribe({
        next: () => {
          this.mostrarMensaje('✅ Contacto eliminado', 'success');
          this.cargarContactos();
        },
        error: () => this.mostrarMensaje('❌ Error al eliminar el contacto', 'error')
      });
    }
  }
  
  // ── Cancelar formulario
  cancelar(): void {
    this.modoFormulario = false;
    this.editando = false;
    // 🔧 LIMPIAR COMPLETAMENTE
    this.contactoActual = {
      nombre: '',
      email: '',
      telefono: '',
      asunto: '',
      mensaje: '',
      estado: 'Nuevo'
    };
    console.log('✅ Formulario limpiado:', this.contactoActual);
  }
  
  // ── Volver a la Landing
  volverALanding(): void {
    this.router.navigate(['/']);
  }
  
  // ── Helpers
  private nuevoContacto(): Contacto {
    return {
      nombre: '',
      email: '',
      telefono: '',
      asunto: '',
      mensaje: '',
      estado: 'Nuevo'
    };
  }
  
  private mostrarMensaje(texto: string, tipo: string): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 4000);
  }
  
  badgeClass(estado: string): string {
    const map: { [key: string]: string } = {
      'Respondido': 'badge-success',
      'En revisión': 'badge-warning',
      'Nuevo': 'badge-info'
    };
    return map[estado] ?? 'badge-secondary';
  }
}