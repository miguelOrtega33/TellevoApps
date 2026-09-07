import { TripService } from './trip.service';

describe('TripService', () => {
  let service: TripService;

  beforeEach(() => {
    localStorage.clear();
    service = new TripService();
  });

  it('provides initial trips when no trips have been published', () => {
    expect(service.getTrips().length).toBeGreaterThan(0);
  });

  it('stores a newly published trip', () => {
    service.addTrip({ driverName: 'Ana', origin: 'Talagante', destination: 'Santiago', departureTime: 'Mañana, 08:00', seats: 3, price: 1500, description: 'Salida desde la plaza principal.' });
    expect(service.getTrips()[0].driverName).toBe('Ana');
  });
});
