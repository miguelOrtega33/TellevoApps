import { Injectable } from '@angular/core';
import { Trip, TripEstimate, TripRequest, TripRequestStatus, TripStats, TripStatus } from '../models/trip.model';

type StoredTrip = Partial<Trip> & { requestedBy?: string };
type NewTrip = Pick<Trip, 'driverName' | 'origin' | 'destination' | 'departureTime' | 'seats' | 'price' | 'description'> &
  Partial<Pick<Trip, 'driverEmail' | 'vehicle' | 'distanceKm' | 'durationMinutes' | 'etaMinutes'>>;

@Injectable({ providedIn: 'root' })
export class TripService {
  private readonly tripsKey = 'tellevo.trips';

  getTrips(): Trip[] {
    const storedTrips = this.readTrips();
    const trips = storedTrips.length ? storedTrips : this.seedTrips();
    return this.sortTrips(trips);
  }

  getTrip(id: string): Trip | undefined {
    return this.getTrips().find((trip) => trip.id === id);
  }

  addTrip(trip: NewTrip): Trip {
    const now = new Date().toISOString();
    const estimate = this.estimateTrip(trip.origin, trip.destination);
    const newTrip: Trip = {
      ...trip,
      id: crypto.randomUUID(),
      driverEmail: trip.driverEmail,
      vehicle: trip.vehicle?.trim() || 'Auto particular',
      rating: 4.9,
      distanceKm: trip.distanceKm ?? estimate.distanceKm,
      durationMinutes: trip.durationMinutes ?? estimate.durationMinutes,
      etaMinutes: trip.etaMinutes ?? estimate.etaMinutes,
      status: 'available',
      requests: [],
      createdAt: now,
      updatedAt: now,
    };
    this.saveTrips([newTrip, ...this.getTrips()]);
    return newTrip;
  }

  requestTrip(id: string, passengerEmail: string, passengerName = 'Pasajero/a', pickupNote = ''): Trip {
    const trips = this.getTrips();
    const trip = trips.find((item) => item.id === id);

    if (!trip) {
      throw new Error('No encontramos este viaje.');
    }

    if (this.availableSeats(trip) <= 0) {
      throw new Error('Este viaje ya no tiene cupos disponibles.');
    }

    const existingRequest = trip.requests.find((request) => request.passengerEmail === passengerEmail && request.status !== 'cancelled');
    if (existingRequest) {
      return trip;
    }

    const now = new Date().toISOString();
    const request: TripRequest = {
      id: crypto.randomUUID(),
      passengerName,
      passengerEmail,
      pickupNote: pickupNote.trim() || undefined,
      status: 'requested',
      requestedAt: now,
      updatedAt: now,
    };

    const updatedTrip: Trip = {
      ...trip,
      status: trip.status === 'available' ? 'requested' : trip.status,
      requests: [...trip.requests, request],
      updatedAt: now,
    };
    this.replaceTrip(updatedTrip, trips);
    return updatedTrip;
  }

  acceptRequest(tripId: string, requestId: string): void {
    this.updateRequestStatus(tripId, requestId, 'accepted', 'accepted');
  }

  startTrip(tripId: string): void {
    const trip = this.getTrip(tripId);
    if (!trip) {
      return;
    }

    const now = new Date().toISOString();
    this.replaceTrip({
      ...trip,
      status: 'in_progress',
      requests: trip.requests.map((request) => request.status === 'accepted' ? { ...request, status: 'in_progress', updatedAt: now } : request),
      updatedAt: now,
    });
  }

  completeTrip(tripId: string): void {
    const trip = this.getTrip(tripId);
    if (!trip) {
      return;
    }

    const now = new Date().toISOString();
    this.replaceTrip({
      ...trip,
      status: 'completed',
      requests: trip.requests.map((request) => ['accepted', 'in_progress'].includes(request.status) ? { ...request, status: 'completed', updatedAt: now } : request),
      updatedAt: now,
    });
  }

  cancelRequest(tripId: string, requestId: string): void {
    this.updateRequestStatus(tripId, requestId, 'cancelled');
  }

  getPassengerTrips(email: string): Trip[] {
    return this.getTrips().filter((trip) => trip.requests.some((request) => request.passengerEmail === email));
  }

  getDriverTrips(driverEmail: string | undefined, driverName: string | undefined): Trip[] {
    const normalizedEmail = driverEmail?.trim().toLowerCase();
    const normalizedName = driverName?.trim().toLowerCase();
    return this.getTrips().filter((trip) => {
      const tripDriverEmail = trip.driverEmail?.trim().toLowerCase();
      const tripDriverName = trip.driverName.trim().toLowerCase();
      return Boolean(normalizedEmail && tripDriverEmail === normalizedEmail) || Boolean(normalizedName && tripDriverName === normalizedName);
    });
  }

  getActivePassengerTrip(email: string): Trip | undefined {
    return this.getPassengerTrips(email).find((trip) => trip.requests.some((request) => request.passengerEmail === email && !['completed', 'cancelled'].includes(request.status)));
  }

  getStats(email: string | undefined, name: string | undefined): TripStats {
    const trips = this.getTrips();
    const passengerTrips = email ? this.getPassengerTrips(email) : [];
    const driverTrips = this.getDriverTrips(email, name);
    return {
      availableTrips: trips.filter((trip) => trip.status === 'available' || trip.status === 'requested').length,
      activeTrips: [...passengerTrips, ...driverTrips].filter((trip, index, list) => list.findIndex((item) => item.id === trip.id) === index && ['accepted', 'in_progress'].includes(trip.status)).length,
      pendingRequests: driverTrips.reduce((total, trip) => total + trip.requests.filter((request) => request.status === 'requested').length, 0),
      completedTrips: [...passengerTrips, ...driverTrips].filter((trip, index, list) => list.findIndex((item) => item.id === trip.id) === index && trip.status === 'completed').length,
    };
  }

  estimateTrip(origin: string, destination: string): TripEstimate {
    const distanceKm = this.estimateDistance(origin, destination);
    const durationMinutes = Math.max(8, Math.round(distanceKm * 2.2));
    const etaMinutes = Math.max(3, Math.min(18, Math.round(distanceKm / 2)));
    const suggestedPrice = Math.max(900, Math.round((600 + distanceKm * 145) / 100) * 100);
    return { distanceKm, durationMinutes, etaMinutes, suggestedPrice };
  }

  availableSeats(trip: Trip): number {
    const occupiedSeats = trip.requests.filter((request) => ['accepted', 'in_progress', 'completed'].includes(request.status)).length;
    return Math.max(0, trip.seats - occupiedSeats);
  }

  private updateRequestStatus(tripId: string, requestId: string, status: TripRequestStatus, tripStatus?: TripStatus): void {
    const trip = this.getTrip(tripId);
    if (!trip) {
      return;
    }

    const now = new Date().toISOString();
    const updatedTrip: Trip = {
      ...trip,
      status: tripStatus ?? this.statusFromRequests(trip.requests),
      requests: trip.requests.map((request) => request.id === requestId ? { ...request, status, updatedAt: now } : request),
      updatedAt: now,
    };

    this.replaceTrip({
      ...updatedTrip,
      status: tripStatus ?? this.statusFromRequests(updatedTrip.requests),
    });
  }

  private statusFromRequests(requests: TripRequest[]): TripStatus {
    if (requests.some((request) => request.status === 'in_progress')) {
      return 'in_progress';
    }
    if (requests.some((request) => request.status === 'accepted')) {
      return 'accepted';
    }
    if (requests.some((request) => request.status === 'requested')) {
      return 'requested';
    }
    return 'available';
  }

  private readTrips(): Trip[] {
    const rawTrips = localStorage.getItem(this.tripsKey);
    if (!rawTrips) {
      return [];
    }

    try {
      const parsedTrips = JSON.parse(rawTrips) as StoredTrip[];
      return parsedTrips.map((trip) => this.normalizeTrip(trip));
    } catch {
      localStorage.removeItem(this.tripsKey);
      return [];
    }
  }

  private replaceTrip(updatedTrip: Trip, trips = this.getTrips()): void {
    this.saveTrips(trips.map((trip) => trip.id === updatedTrip.id ? updatedTrip : trip));
  }

  private saveTrips(trips: Trip[]): void {
    localStorage.setItem(this.tripsKey, JSON.stringify(trips));
  }

  private normalizeTrip(trip: StoredTrip): Trip {
    const now = new Date().toISOString();
    const estimate = this.estimateTrip(trip.origin ?? '', trip.destination ?? '');
    const requests = trip.requests ?? this.legacyRequest(trip);
    return {
      id: trip.id ?? crypto.randomUUID(),
      driverName: trip.driverName?.trim() || 'Conductor/a',
      driverEmail: trip.driverEmail,
      vehicle: trip.vehicle?.trim() || 'Auto particular',
      rating: trip.rating ?? 4.8,
      origin: trip.origin?.trim() || 'Origen por confirmar',
      destination: trip.destination?.trim() || 'Destino por confirmar',
      departureTime: trip.departureTime?.trim() || 'Horario por confirmar',
      seats: Number(trip.seats) || 1,
      price: Number(trip.price) || estimate.suggestedPrice,
      description: trip.description?.trim() || 'Viaje publicado en Tellevo.',
      distanceKm: trip.distanceKm ?? estimate.distanceKm,
      durationMinutes: trip.durationMinutes ?? estimate.durationMinutes,
      etaMinutes: trip.etaMinutes ?? estimate.etaMinutes,
      status: trip.status ?? this.statusFromRequests(requests),
      requests,
      createdAt: trip.createdAt ?? now,
      updatedAt: trip.updatedAt ?? now,
      requestedBy: trip.requestedBy,
    };
  }

  private legacyRequest(trip: StoredTrip): TripRequest[] {
    if (!trip.requestedBy) {
      return [];
    }

    const now = new Date().toISOString();
    return [{
      id: `${trip.id ?? crypto.randomUUID()}-${trip.requestedBy}`,
      passengerEmail: trip.requestedBy,
      passengerName: trip.requestedBy.split('@')[0] || 'Pasajero/a',
      status: 'requested',
      requestedAt: now,
      updatedAt: now,
    }];
  }

  private estimateDistance(origin: string, destination: string): number {
    const knownCoordinates: Record<string, [number, number]> = {
      bollenar: [-33.552, -71.009],
      curacavi: [-33.399, -71.128],
      maipu: [-33.510, -70.756],
      melipilla: [-33.685, -71.215],
      pomaire: [-33.647, -71.158],
      'san antonio': [-33.594, -71.607],
      santiago: [-33.449, -70.669],
      talagante: [-33.664, -70.927],
    };
    const originCoordinates = knownCoordinates[origin.trim().toLowerCase()];
    const destinationCoordinates = knownCoordinates[destination.trim().toLowerCase()];

    if (originCoordinates && destinationCoordinates) {
      return Math.max(4, Math.round(this.haversine(originCoordinates, destinationCoordinates) * 1.18));
    }

    const fingerprint = `${origin}|${destination}`.split('').reduce((total, letter) => total + letter.charCodeAt(0), 0);
    return 6 + (fingerprint % 34);
  }

  private haversine(origin: [number, number], destination: [number, number]): number {
    const radiusKm = 6371;
    const latitudeDelta = this.toRadians(destination[0] - origin[0]);
    const longitudeDelta = this.toRadians(destination[1] - origin[1]);
    const startLatitude = this.toRadians(origin[0]);
    const endLatitude = this.toRadians(destination[0]);
    const angle = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;
    return 2 * radiusKm * Math.atan2(Math.sqrt(angle), Math.sqrt(1 - angle));
  }

  private toRadians(value: number): number {
    return value * Math.PI / 180;
  }

  private seedTrips(): Trip[] {
    const now = new Date().toISOString();
    const seedData: NewTrip[] = [
      {
        driverName: 'Miguel',
        driverEmail: 'miguel@tellevo.local',
        vehicle: 'Toyota Yaris gris',
        origin: 'Melipilla',
        destination: 'Bollenar',
        departureTime: 'Hoy, 17:30',
        seats: 2,
        price: 1200,
        description: 'Salida desde Lider Vicuna Mackenna. Punto de encuentro por coordinar.',
      },
      {
        driverName: 'Camila',
        driverEmail: 'camila@tellevo.local',
        vehicle: 'Hyundai Accent blanco',
        origin: 'Melipilla',
        destination: 'Bollenar',
        departureTime: 'Hoy, 18:15',
        seats: 3,
        price: 1000,
        description: 'Viaje compartido con espacio para equipaje pequeno.',
      },
      {
        driverName: 'Daniel',
        driverEmail: 'daniel@tellevo.local',
        vehicle: 'Nissan Versa azul',
        origin: 'Talagante',
        destination: 'Santiago',
        departureTime: 'Manana, 08:00',
        seats: 2,
        price: 3200,
        description: 'Ruta directa por Autopista del Sol con bajada en metro Universidad de Santiago.',
      },
    ];

    return seedData.map((trip, index) => {
      const estimate = this.estimateTrip(trip.origin, trip.destination);
      return {
        ...trip,
        id: `seed-trip-${index + 1}`,
        rating: 4.8 + index * 0.03,
        distanceKm: estimate.distanceKm,
        durationMinutes: estimate.durationMinutes,
        etaMinutes: estimate.etaMinutes,
        status: 'available',
        requests: [],
        createdAt: now,
        updatedAt: now,
      };
    });
  }

  private sortTrips(trips: Trip[]): Trip[] {
    const statusPriority: Record<TripStatus, number> = {
      in_progress: 0,
      accepted: 1,
      requested: 2,
      available: 3,
      completed: 4,
      cancelled: 5,
    };
    return [...trips].sort((first, second) => statusPriority[first.status] - statusPriority[second.status] || second.updatedAt.localeCompare(first.updatedAt));
  }
}
