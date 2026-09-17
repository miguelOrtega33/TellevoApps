import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Subscription, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { TripEstimate } from '../models/trip.model';
import { AuthService } from '../services/auth.service';
import { TripService } from '../services/trip.service';

@Component({ selector: 'app-mapa', templateUrl: './mapa.page.html', styleUrls: ['./mapa.page.scss'] })
export class MapaPage implements OnDestroy {
  submitting = false;
  estimate: TripEstimate = this.tripService.estimateTrip('Melipilla', 'Bollenar');
  private estimateSubscription: Subscription;

  tripForm = this.fb.group({
    origin: ['Melipilla', [Validators.required, Validators.minLength(2)]],
    destination: ['Bollenar', [Validators.required, Validators.minLength(2)]],
    departureTime: [this.defaultDeparture(), Validators.required],
    seats: [2, [Validators.required, Validators.min(1), Validators.max(8)]],
    price: [this.estimate.suggestedPrice, [Validators.required, Validators.min(0)]],
    vehicle: ['Auto particular', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    description: ['Salida puntual. Coordinamos el punto exacto al aceptar la solicitud.', [Validators.required, Validators.minLength(10), Validators.maxLength(180)]],
  });

  constructor(
    private fb: FormBuilder,
    private tripService: TripService,
    private auth: AuthService,
    private alertController: AlertController,
    private router: Router,
  ) {
    this.estimateSubscription = this.tripForm.valueChanges.pipe(
      map(({ origin, destination }) => `${origin?.trim() ?? ''}|${destination?.trim() ?? ''}`),
      debounceTime(250),
      distinctUntilChanged(),
    ).subscribe(() => this.updateEstimate());
  }

  ngOnDestroy(): void {
    this.estimateSubscription.unsubscribe();
  }

  async publicar(): Promise<void> {
    if (this.tripForm.invalid || this.submitting) {
      this.tripForm.markAllAsTouched();
      return;
    }

    const value = this.tripForm.getRawValue();
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      return;
    }

    this.submitting = true;
    this.tripService.addTrip({
      driverName: currentUser.name,
      driverEmail: currentUser.email,
      vehicle: value.vehicle ?? 'Auto particular',
      origin: value.origin ?? '',
      destination: value.destination ?? '',
      departureTime: this.formatDate(value.departureTime ?? ''),
      seats: Number(value.seats),
      price: Number(value.price),
      description: value.description ?? '',
      distanceKm: this.estimate.distanceKm,
      durationMinutes: this.estimate.durationMinutes,
      etaMinutes: this.estimate.etaMinutes,
    });
    this.submitting = false;

    const alert = await this.alertController.create({
      header: 'Ruta publicada',
      message: 'Tu viaje ya aparece disponible y podras aceptar solicitudes desde el inicio.',
      buttons: ['Ver viajes'],
    });
    await alert.present();
    await alert.onDidDismiss();
    await this.router.navigate(['/viajes']);
  }

  useSuggestedPrice(): void {
    this.tripForm.controls.price.setValue(this.estimate.suggestedPrice);
  }

  private updateEstimate(): void {
    const origin = this.tripForm.controls.origin.value ?? '';
    const destination = this.tripForm.controls.destination.value ?? '';
    if (origin.trim().length < 2 || destination.trim().length < 2) {
      return;
    }

    this.estimate = this.tripService.estimateTrip(origin, destination);
    if (!this.tripForm.controls.price.dirty || Number(this.tripForm.controls.price.value) === 0) {
      this.tripForm.controls.price.setValue(this.estimate.suggestedPrice, { emitEvent: false });
    }
  }

  private formatDate(value: string): string {
    if (!value) {
      return 'Horario por confirmar';
    }

    const date = new Date(value);
    return new Intl.DateTimeFormat('es-CL', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  private defaultDeparture(): string {
    const date = new Date();
    date.setHours(date.getHours() + 1, 0, 0, 0);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hour = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    return `${year}-${month}-${day}T${hour}:${minutes}`;
  }
}
