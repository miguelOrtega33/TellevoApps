import { Injectable } from '@angular/core';
import { Trip } from '../models/trip.model';

@Injectable({ providedIn: 'root' })
export class TripService {
  private readonly tripsKey = 'tellevo.trips';

  getTrips(): Trip[] {
    const storedTrips = this.readTrips();
    return storedTrips.length ? storedTrips : this.seedTrips();
  }

  addTrip(trip: Omit<Trip, 'id' | 'requestedBy'>): void {
    const trips = this.getTrips();
    const newTrip: Trip = { ...trip, id: crypto.randomUUID() };
    localStorage.setItem(this.tripsKey, JSON.stringify([newTrip, ...trips]));
  }

  requestTrip(id: string, userEmail: string): void {
    const trips = this.getTrips().map((trip) => trip.id === id ? { ...trip, requestedBy: userEmail } : trip);
    localStorage.setItem(this.tripsKey, JSON.stringify(trips));
  }

  private readTrips(): Trip[] {
    const rawTrips = localStorage.getItem(this.tripsKey);
    if (!rawTrips) {
      return [];
    }

    try {
      return JSON.parse(rawTrips) as Trip[];
    } catch {
      localStorage.removeItem(this.tripsKey);
      return [];
    }
  }

  private seedTrips(): Trip[] {
    return [
      {
        id: 'melipilla-bollenar-1730',
        driverName: 'Miguel',
        origin: 'Melipilla',
        destination: 'Bollenar',
        departureTime: 'Hoy, 17:30',
        seats: 2,
        price: 1200,
        description: 'Salida desde Líder Vicuña Mackenna. Punto de encuentro por coordinar.',
      },
      {
        id: 'melipilla-bollenar-1815',
        driverName: 'Camila',
        origin: 'Melipilla',
        destination: 'Bollenar',
        departureTime: 'Hoy, 18:15',
        seats: 3,
        price: 1000,
        description: 'Viaje compartido con espacio para equipaje pequeño.',
      },
    ];
  }
}
