import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Trip } from '../models/trip.model';
import { AuthService } from '../services/auth.service';
import { TripService } from '../services/trip.service';

@Component({ selector: 'app-viajes', templateUrl: './viajes.page.html', styleUrls: ['./viajes.page.scss'] })
export class ViajesPage implements OnInit {
  trips: Trip[] = [];
  filteredTrips: Trip[] = [];
  query = '';
  constructor(private tripService: TripService, private auth: AuthService, private alertController: AlertController) {}
  ngOnInit(): void { this.loadTrips(); }
  ionViewWillEnter(): void { this.loadTrips(); }
  filterTrips(): void {
    const query = this.query.trim().toLowerCase();
    this.filteredTrips = this.trips.filter((trip) => !query || `${trip.origin} ${trip.destination} ${trip.driverName}`.toLowerCase().includes(query));
  }
  isRequested(trip: Trip): boolean { return trip.requestedBy === this.auth.currentUser?.email; }
  async solicitar(trip: Trip): Promise<void> {
    const email = this.auth.currentUser?.email;
    if (!email || this.isRequested(trip)) { return; }
    this.tripService.requestTrip(trip.id, email);
    this.loadTrips();
    const alert = await this.alertController.create({ header: 'Solicitud enviada', message: `Avisaremos a ${trip.driverName} de tu interés por esta ruta.`, buttons: ['Entendido'] });
    await alert.present();
  }
  private loadTrips(): void { this.trips = this.tripService.getTrips(); this.filterTrips(); }
}
