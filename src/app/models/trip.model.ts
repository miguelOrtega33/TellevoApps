export type TripStatus = 'available' | 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type TripRequestStatus = 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface TripRequest {
  id: string;
  passengerName: string;
  passengerEmail: string;
  status: TripRequestStatus;
  requestedAt: string;
  updatedAt: string;
  pickupNote?: string;
}

export interface TripEstimate {
  distanceKm: number;
  durationMinutes: number;
  etaMinutes: number;
  suggestedPrice: number;
}

export interface Trip {
  id: string;
  driverName: string;
  driverEmail?: string;
  vehicle?: string;
  rating: number;
  origin: string;
  destination: string;
  departureTime: string;
  seats: number;
  price: number;
  description: string;
  distanceKm: number;
  durationMinutes: number;
  etaMinutes: number;
  status: TripStatus;
  requests: TripRequest[];
  createdAt: string;
  updatedAt: string;
  requestedBy?: string;
}

export interface TripStats {
  availableTrips: number;
  activeTrips: number;
  pendingRequests: number;
  completedTrips: number;
}
