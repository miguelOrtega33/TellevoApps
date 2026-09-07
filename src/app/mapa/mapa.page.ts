import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { TripService } from '../services/trip.service';

@Component({ selector: 'app-mapa', templateUrl: './mapa.page.html', styleUrls: ['./mapa.page.scss'] })
export class MapaPage {
  submitting = false;
  tripForm = this.fb.group({
    origin: ['', [Validators.required, Validators.minLength(2)]],
    destination: ['', [Validators.required, Validators.minLength(2)]],
    departureTime: ['', Validators.required],
    seats: [2, [Validators.required, Validators.min(1), Validators.max(8)]],
    price: [0, [Validators.required, Validators.min(0)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(180)]],
  });

  constructor(private fb: FormBuilder, private tripService: TripService, private auth: AuthService, private alertController: AlertController, private router: Router) {}

  async publicar(): Promise<void> {
    if (this.tripForm.invalid || this.submitting) { this.tripForm.markAllAsTouched(); return; }
    const value = this.tripForm.getRawValue();
    const driverName = this.auth.currentUser?.name;
    if (!driverName) { return; }
    this.submitting = true;
    this.tripService.addTrip({ driverName, origin: value.origin ?? '', destination: value.destination ?? '', departureTime: this.formatDate(value.departureTime ?? ''), seats: Number(value.seats), price: Number(value.price), description: value.description ?? '' });
    this.submitting = false;
    const alert = await this.alertController.create({ header: 'Ruta publicada', message: 'Tu viaje ya aparece disponible para otros pasajeros.', buttons: ['Ver viajes'] });
    await alert.present(); await alert.onDidDismiss(); await this.router.navigate(['/viajes']);
  }

  private formatDate(value: string): string {
    if (!value) { return 'Horario por confirmar'; }
    const date = new Date(value);
    return new Intl.DateTimeFormat('es-CL', { weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
  }
}
