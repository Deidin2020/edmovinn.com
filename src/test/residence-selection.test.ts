import { describe, expect, it } from 'vitest';
import { canRequestBooking, getResidence, moveinn, prepareRoomSelection, type Residence } from '@/lib/residences';

describe('Accommodation details selection rules', () => {
  it('prepares the selected room with its actual record values', () => {
    const residence: Residence = { ...moveinn, rooms: [{ id: 'single-test', type: 'single', occupancy: 1, price: 1200, image: '', availability: 'available', amenities: [] }] };
    expect(prepareRoomSelection(residence, 'single-test')).toEqual({ residenceSlug: 'moveinn', roomId: 'single-test', roomType: 'single', occupancy: 1, monthlyPrice: 1200, currency: 'TRY', isMock: true });
  });
  it('rejects rooms that do not belong to the residence', () => { expect(prepareRoomSelection(moveinn, 'other-residence-room')).toBeNull(); });
  it('rejects unavailable rooms', () => {
    const residence: Residence = { ...moveinn, rooms: [{ id: 'unavailable', type: 'double', occupancy: 2, price: 900, image: '', availability: 'unavailable', amenities: [] }] };
    expect(prepareRoomSelection(residence, 'unavailable')).toBeNull();
  });
  it('never allows a mock residence to create a booking', () => { expect(canRequestBooking({ ...moveinn, verified: true })).toBe(false); });
  it('does not present Moveinn as verified', () => { expect(moveinn.verified).toBe(false); expect(moveinn.isMock).toBe(true); });
  it('does not invent an address, coordinates or university distances', () => { expect(moveinn.address).toBeUndefined(); expect(moveinn.coordinates).toBeUndefined(); expect(moveinn.universities).toEqual([]); });
  it('resolves homepage identifiers to matching room options only', () => {
    expect(getResidence('demo-twin')?.rooms.map(room => room.type)).toEqual(['single', 'double']);
    expect(getResidence('demo-shared')?.rooms.map(room => room.type)).toEqual(['double', 'triple']);
    expect(getResidence('not-listed')).toBeUndefined();
  });
});
