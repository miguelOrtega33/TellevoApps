export interface Trip {
  id: string;
  driverName: string;
  origin: string;
  destination: string;
  departureTime: string;
  seats: number;
  price: number;
  description: string;
  requestedBy?: string;
}
