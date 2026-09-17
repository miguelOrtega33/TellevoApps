import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Trip, TripRequest } from '../models/trip.model';
import { AuthService } from '../services/auth.service';
import { TripService } from '../services/trip.service';

type TripFilter = 'all' | 'available' | 'mine';

@Component({ selector: 'app-viajes', templateUrl: './viajes.page.html', styleUrls: ['./viajes.page.scss'] })
export class ViajesPage implements OnInit {
  trips: Trip[] = [];
  filteredTrips: Trip[] = [];
  query = '';
  filter: TripFilter = 'available';

  constructor(private tripService: TripService, private auth: AuthService, private alertController: AlertController) {}

  ngOnInit(): void {
    this.loadTrips();
  }

  ionViewWillEnter(): void {
    this.loadTrips();
  }

  setFilter(filter: TripFilter): void {
    this.filter = filter;
    this.filterTrips();
  }

  filterTrips(): void {
    const query = this.query.trim().toLowerCase();
    const currentEmail = this.auth.currentUser?.email;

    this.filteredTrips = this.trips.filter((trip) => {
      const matchesQuery = !query || `${trip.origin} ${trip.destination} ${trip.driverName} ${trip.vehicle ?? ''}`.toLowerCase().includes(query);
      const hasSeats = this.availableSeats(trip) > 0;
      const isMine = Boolean(currentEmail && trip.requests.some((request) => request.passengerEmail === currentEmail));

      if (this.filter === 'available') {
        return matchesQuery && ['available', 'requested'].includes(trip.status) && hasSeats && !isMine;
      }

      if (this.filter === 'mine') {
        return matchesQuery && isMine;
      }

      return matchesQuery;
    });
  }

  availableSeats(trip: Trip): number {
    return this.tripService.availableSeats(trip);
  }

  requestForCurrentUser(trip: Trip): TripRequest | undefined {
    const email = this.auth.currentUser?.email;
    return email ? trip.requests.find((request) => request.passengerEmail === email) : undefined;
  }

  isRequested(trip: Trip): boolean {
    return Boolean(this.requestForCurrentUser(trip));
  }

  tripStatusLabel(trip: Trip): string {
    const labels: Record<Trip['status'], string> = {
      accepted: 'Aceptado',
      available: 'Disponible',
      cancelled: 'Cancelado',
      completed: 'Completado',
      in_progress: 'En curso',
      requested: 'Con solicitudes',
    };
    return labels[trip.status];
  }

  requestStatusLabel(status: TripRequest['status']): string {
    const labels: Record<TripRequest['status'], string> = {
      accepted: 'Aceptado',
      cancelled: 'Cancelado',
      completed: 'Completado',
      in_progress: 'En curso',
      requested: 'Pendiente',
    };
    return labels[status];
  }

  async solicitar(trip: Trip): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser || this.isRequested(trip)) {
      return;
    }

    const prompt = await this.alertController.create({
      header: 'Solicitar viaje',
      message: `Pide un cupo a ${trip.driverName}. Puedes sumar una nota corta para coordinar el punto de encuentro.`,
      inputs: [
        {
          name: 'pickupNote',
          placeholder: 'Ej. me subo frente a la plaza',
          type: 'textarea',
          attributes: { maxlength: 100 },
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Enviar solicitud', role: 'confirm' },
      ],
    });

    await prompt.present();
    const result = await prompt.onDidDismiss();
    if (result.role !== 'confirm') {
      return;
    }

    const values = result.data?.values as { pickupNote?: string } | undefined;

    try {
      this.tripService.requestTrip(trip.id, currentUser.email, currentUser.name, values?.pickupNote ?? '');
      this.loadTrips();
      const alert = await this.alertController.create({
        header: 'Solicitud enviada',
        message: `Avisaremos a ${trip.driverName}. Podras seguir el estado desde el inicio.`,
        buttons: ['Entendido'],
      });
      await alert.present();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos enviar la solicitud.';
      const alert = await this.alertController.create({ header: 'No se pudo solicitar', message, buttons: ['Entendido'] });
      await alert.present();
    }
  }

  private loadTrips(): void {
    this.trips = this.tripService.getTrips();
    this.filterTrips();
  }
}
