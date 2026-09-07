import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Trip } from '../models/trip.model';
import { AuthService } from '../services/auth.service';
import { TripService } from '../services/trip.service';

@Component({ selector: 'app-tellevo', templateUrl: './tellevo.page.html', styleUrls: ['./tellevo.page.scss'] })
export class TellevoPage implements OnInit {
  trips: Trip[] = [];
  nombreUsuario = this.auth.currentUser?.name ?? 'viajero/a';
  constructor(private router: Router, private menu: MenuController, private auth: AuthService, private tripService: TripService) {}
  ngOnInit(): void { this.loadTrips(); this.menu.enable(true); }
  ionViewWillEnter(): void { this.loadTrips(); }
  abrirMapa(): void { this.router.navigate(['/mapa']); this.menu.close(); }
  private loadTrips(): void { this.trips = this.tripService.getTrips().slice(0, 2); }
}
