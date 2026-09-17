import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, MenuController } from '@ionic/angular';
import { Trip, TripRequest, TripStats } from '../models/trip.model';
import { AuthService } from '../services/auth.service';
import { TripService } from '../services/trip.service';

@Component({ selector: 'app-tellevo', templateUrl: './tellevo.page.html', styleUrls: ['./tellevo.page.scss'] })
export class TellevoPage implements OnInit {
  trips: Trip[] = [];
  driverTrips: Trip[] = [];
  passengerTrips: Trip[] = [];
  activeTrip?: Trip;
  stats: TripStats = { availableTrips: 0, activeTrips: 0, pendingRequests: 0, completedTrips: 0 };
  nombreUsuario = this.auth.currentUser?.name ?? 'viajero/a';

  constructor(
    private router: Router,
    private menu: MenuController,
    private auth: AuthService,
    private tripService: TripService,
    private alertController: AlertController,
  ) {}

  ngOnInit(): void {
    this.menu.enable(true);
    this.loadDashboard();
  }

  ionViewWillEnter(): void {
    this.loadDashboard();
  }

  abrirMapa(): void {
    this.router.navigate(['/mapa']);
    this.menu.close();
  }

  availableSeats(trip: Trip): number {
    return this.tripService.availableSeats(trip);
  }

  pendingRequests(trip: Trip): TripRequest[] {
    return trip.requests.filter((request) => request.status === 'requested');
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

  async acceptRequest(trip: Trip, request: TripRequest): Promise<void> {
    this.tripService.acceptRequest(trip.id, request.id);
    this.loadDashboard();
    const alert = await this.alertController.create({
      header: 'Solicitud aceptada',
      message: `${request.passengerName} ya puede ver que confirmaste el viaje.`,
      buttons: ['Listo'],
    });
    await alert.present();
  }

  async rejectRequest(trip: Trip, request: TripRequest): Promise<void> {
    this.tripService.cancelRequest(trip.id, request.id);
    this.loadDashboard();
    const alert = await this.alertController.create({
      header: 'Solicitud rechazada',
      message: `La solicitud de ${request.passengerName} quedo cerrada y el cupo sigue disponible.`,
      buttons: ['Listo'],
    });
    await alert.present();
  }

  startTrip(trip: Trip): void {
    this.tripService.startTrip(trip.id);
    this.loadDashboard();
  }

  completeTrip(trip: Trip): void {
    this.tripService.completeTrip(trip.id);
    this.loadDashboard();
  }

  private loadDashboard(): void {
    const currentUser = this.auth.currentUser;
    this.nombreUsuario = currentUser?.name ?? 'viajero/a';
    this.trips = this.tripService.getTrips().filter((trip) => ['available', 'requested'].includes(trip.status)).slice(0, 3);
    this.driverTrips = this.tripService.getDriverTrips(currentUser?.email, currentUser?.name);
    this.passengerTrips = currentUser?.email ? this.tripService.getPassengerTrips(currentUser.email) : [];
    this.activeTrip = currentUser?.email ? this.tripService.getActivePassengerTrip(currentUser.email) : undefined;
    this.stats = this.tripService.getStats(currentUser?.email, currentUser?.name);
  }
}
