import { describe, expect, it } from 'vitest';
import { canRequestBooking, detailPreview, getResidence, moveinn, prepareRoomSelection, type Residence } from '@/lib/residences';

describe('Accommodation details selection rules', () => {
  it('prepares the selected room with its actual record values', () => {
    const residence: Residence = { ...moveinn, rooms: [{ id: 'single-test', type: 'single', occupancy: 1, price: 1200, image: '', availability: 'available', amenities: [] }] };
    expect(prepareRoomSelection(residence, 'single-test')).toEqual({ residenceSlug: 'moveinn', roomId: 'single-test', roomType: 'single', occupancy: 1, monthlyPrice: 1200, currency: 'USD', isMock: false });
  });
  it('rejects rooms that do not belong to the residence', () => { expect(prepareRoomSelection(moveinn, 'other-residence-room')).toBeNull(); });
  it('rejects unavailable rooms', () => {
    const residence: Residence = { ...moveinn, rooms: [{ id: 'unavailable', type: 'double', occupancy: 2, price: 900, image: '', availability: 'unavailable', amenities: [] }] };
    expect(prepareRoomSelection(residence, 'unavailable')).toBeNull();
  });
  it('never allows a mock residence to create a booking', () => { expect(canRequestBooking({ ...moveinn, isMock: true, verified: true })).toBe(false); });
  it('does not present owner-supplied Moveinn as verified', () => { expect(moveinn.verified).toBe(false); expect(moveinn.isMock).toBe(false); expect(canRequestBooking(moveinn)).toBe(false); });
  it('does not invent coordinates or university distances', () => { expect(moveinn.coordinates).toBeUndefined(); expect(moveinn.universities).toEqual([]); });
  it('uses male housing for Moveinn', () => { expect(moveinn.genderKey).toBe('search.male'); });
  it('provides mandatory gender for every demo residence', () => {
    expect(['demo-twin', 'demo-single', 'demo-studio', 'demo-shared'].map(slug => getResidence(slug)?.genderKey)).toEqual(['search.male', 'search.female', 'search.female', 'search.male']);
  });
  it('fills only a separate display model without claiming real verification', () => {
    const preview = detailPreview(moveinn);
    expect(preview.coordinates).toEqual({ lat: 41.0628, lng: 28.8077 });
    expect(preview.rooms[0]?.bed).toBe('details.sampleBed');
    expect(moveinn.coordinates).toBeUndefined();
    expect(moveinn.rooms[0]?.bed).toBeUndefined();
    expect(preview.verified).toBe(false);
  });
  it('uses the supplied location on Basın Ekspres opposite Mall of Istanbul', () => { expect(moveinn.address).toBe('Basın Ekspres, Küçükçekmece, Istanbul — opposite Mall of Istanbul'); });
  it('lists exactly the twelve owner-supplied services', () => { expect(moveinn.facilities).toEqual(['buffet', 'cafeteria', 'gym', 'heating', 'laundry', 'library', 'mosque', 'receptionHall', 'refrigerator', 'sauna', 'turkishBath', 'wifi']); });
  it('does not invent additional Moveinn room types', () => { expect(moveinn.rooms.map(room => room.type)).toEqual(['quadruple']); });
  it('uses the supplied USD 375 monthly price', () => { expect(moveinn.rooms[0]?.price).toBe(375); expect(moveinn.currency).toBe('USD'); });
  it('uses the supplied USD 750 deposit', () => { expect(moveinn.rooms[0]?.deposit).toBe(750); });
  it('uses the supplied 24.80 square metre size', () => { expect(moveinn.rooms[0]?.area).toBe(24.80); });
  it('uses the supplied 2026-11-01 availability date without confirming live stock', () => { expect(moveinn.rooms[0]?.availableFrom).toBe('2026-11-01'); expect(moveinn.rooms[0]?.availability).toBe('unconfirmed'); });
  it('uses the monthly contract and does not invent bed details', () => { expect(moveinn.rooms[0]?.contract).toBe('monthly'); expect(moveinn.rooms[0]?.bed).toBeUndefined(); });
  it('resolves homepage identifiers to matching room options only', () => {
    expect(getResidence('demo-twin')?.rooms.map(room => room.type)).toEqual(['single', 'double']);
    expect(getResidence('demo-shared')?.rooms.map(room => room.type)).toEqual(['double', 'triple']);
    expect(getResidence('not-listed')).toBeUndefined();
  });
});
