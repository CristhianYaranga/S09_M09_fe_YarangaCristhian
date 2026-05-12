import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class LandingComponent {
  constructor(private router: Router) {}

  irAReservas(): void {
    this.router.navigate(['/reservas']);
  }

  irAContacto(): void {
    this.router.navigate(['/contacto']);
  }
}