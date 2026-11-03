export const API_BASE = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:8080" : "https://api.edmovinn.com")
).replace(/\/$/, "");
let csrf = "";
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T>(path: string, method = "GET", data?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}/api/v1${path}`, {
    method,
    credentials: "include",
    headers: {
      ...(data === undefined ? {} : { "Content-Type": "application/json" }),
      ...(method === "GET" ? {} : { "X-CSRF-Token": csrf }),
    },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok)
    throw new ApiError(
      result?.error?.message || `Request failed (${response.status})`,
      response.status,
    );
  if (result?.data?.csrf) csrf = result.data.csrf;
  return result.data;
}
export const mediaUrl = (path: string) => (path.startsWith("/api/") ? API_BASE + path : path);
export const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en", { style: "currency", currency }).format(amount);
export type Student = {
  id: number;
  name: string;
  email: string;
  phone: string;
  university?: string;
  nationality?: string;
  address?: string;
  date_of_birth?: string;
};
export type Session = { user: Student; csrf: string };
export type Room = {
  price_id?: number | null;
  offer_id?: string;
  slug: string;
  property_name: string;
  property_slug: string;
  property_type: string;
  area: string;
  available_from: string;
  available_to: string;
  facilities: string[];
  id: number;
  property_id: number;
  name: string;
  description: string;
  city: string;
  country: string;
  state: string;
  capacity: number;
  room_type: string;
  gender: string;
  university_name: string;
  currency: string;
  price: number | null;
  deposit: number;
  reservation_type: string;
  status: string;
  floor: string;
  details: string[];
  transport_notes: string;
  image: string;
  media: { url: string; caption: string }[];
  bookable: boolean;
  booking_unavailable_reason?: string | null;
  contract_period?: string;
  review_required?: boolean;
};
export type Accommodation = {
  slug: string;
  media: { url: string; caption: string }[];
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  district: string;
  university: string;
  gender: string;
  reservation_type: string;
  property_type: string;
  seo_title: string;
  seo_description: string;
  image: string;
  facilities: string[];
  rooms: Room[];
  transportation: {
    type: string;
    name: string;
    destination: string;
    walking_minutes: number;
    travel_minutes: number;
  }[];
};
export type Catalog = {
  facets?: Record<string, string[]>;
  rooms: Room[];
  accommodations: Accommodation[];
  rooms_pagination: { total_records: number; last_page: number };
  accommodations_pagination: { total_records: number; last_page: number };
};
export type Booking = {
  contract_type?: string;
  id: number;
  property_name: string;
  room_number: string;
  quantity: number;
  start_date: string;
  end_date: string;
  currency: string;
  amount_cents: number;
  deposit_cents: number;
  quote_cents: number | null;
  status: string;
  payment_status: string;
  latest_payment_status: string | null;
};

export const offerQuery = (priceId?: number | null) => priceId ? `?price_id=${priceId}` : "";
export const roomLink = (room: Room) => `/rooms/${room.slug || room.id}${offerQuery(room.price_id)}`;
