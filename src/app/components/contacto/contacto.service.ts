import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contacto } from './contacto.model';

@Injectable({ providedIn: 'root' })
export class ContactoService {
  private apiUrl = 'http://localhost:8085/api/contactos';

  constructor(private http: HttpClient) {}

  listar(): Observable<Contacto[]> {
    return this.http.get<Contacto[]>(this.apiUrl);
  }

  crear(contacto: Contacto): Observable<Contacto> {
    console.log('📤 Enviando contacto:', contacto);
    return this.http.post<Contacto>(this.apiUrl, contacto);
  }

  obtenerPorId(id: number): Observable<Contacto> {
    return this.http.get<Contacto>(`${this.apiUrl}/${id}`);
  }

  actualizar(id: number, contacto: Contacto): Observable<Contacto> {
    console.log('📝 Actualizando contacto:', contacto);
    return this.http.put<Contacto>(`${this.apiUrl}/${id}`, contacto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}