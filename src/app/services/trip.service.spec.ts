import { TripService } from './trip.service';

describe('TripService', () => {
  let service: TripService;

  beforeEach(() => {
    localStorage.clear();
    service = new TripService();
  });

  it('provides initial trips when no trips have been published', () => {
    expect(service.getTrips().length).toBeGreaterThan(0);
    expect(service.getTrips()[0].distanceKm).toBeGreaterThan(0);
  });

  it('stores a newly published trip with local route estimates', () => {
    const trip = service.addTrip({
      driverName: 'Ana',
      driverEmail: 'ana@demo.cl',
      origin: 'Talagante',
      destination: 'Santiago',
      departureTime: 'Manana, 08:00',
      seats: 3,
      price: 1500,
      description: 'Salida desde la plaza principal.',
    });

    expect(service.getTrips()[0].driverName).toBe('Ana');
    expect(trip.durationMinutes).toBeGreaterThan(0);
  });

  it('tracks a passenger request and driver acceptance', () => {
    const trip = service.getTrips()[0];
    const requestedTrip = service.requestTrip(trip.id, 'pasajera@demo.cl', 'Pasajera');
    const request = requestedTrip.requests[0];

    service.acceptRequest(requestedTrip.id, request.id);
    const acceptedTrip = service.getTrip(requestedTrip.id);

    expect(acceptedTrip?.status).toBe('accepted');
    expect(acceptedTrip?.requests[0].status).toBe('accepted');
  });

  it('summarizes driver pending requests', () => {
    const trip = service.addTrip({
      driverName: 'Miguel',
      driverEmail: 'miguel@demo.cl',
      origin: 'Melipilla',
      destination: 'Bollenar',
      departureTime: 'Hoy, 19:00',
      seats: 2,
      price: 1300,
      description: 'Salida desde el centro.',
    });

    service.requestTrip(trip.id, 'pasajero@demo.cl', 'Pasajero');

    expect(service.getStats('miguel@demo.cl', 'Miguel').pendingRequests).toBe(1);
  });
});
