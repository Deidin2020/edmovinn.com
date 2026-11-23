import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { RoomBookingSidebar, RoomPhotoGallery, roomPhotos } from '@/components/edmovinn/room-interactions';
import { moveinn, type Residence } from '@/lib/residences';

afterEach(cleanup);

describe('Detail-page room interactions', () => {
  it('uses only the existing room image when no extra room photos are supplied', () => {
    const room = moveinn.rooms[0];
    if (!room) throw new Error('Missing supplied room');
    expect(roomPhotos(room)).toEqual([room.image]);
    render(<RoomPhotoGallery photos={roomPhotos(room)} title="Room" />);
    expect(screen.getByRole('button', { name: 'Next photo' })).toBeDisabled();
  });

  it('browses room-owned photos in both directions with wraparound', () => {
    render(<RoomPhotoGallery photos={['first.webp', 'second.webp']} title="Room" />);
    fireEvent.click(screen.getByRole('button', { name: 'Next photo' }));
    expect(screen.getByRole('img')).toHaveAttribute('src', 'second.webp');
    fireEvent.click(screen.getByRole('button', { name: 'Next photo' }));
    expect(screen.getByRole('img')).toHaveAttribute('src', 'first.webp');
    fireEvent.click(screen.getByRole('button', { name: 'Previous photo' }));
    expect(screen.getByRole('img')).toHaveAttribute('src', 'second.webp');
  });

  it('supports horizontal mobile swipes without intercepting vertical scrolling', () => {
    const { container } = render(<RoomPhotoGallery photos={['first.webp', 'second.webp']} title="Room" />);
    const browser = container.firstElementChild;
    if (!browser) throw new Error('Missing gallery');
    fireEvent.touchStart(browser, { touches: [{ clientX: 200, clientY: 100 }] });
    fireEvent.touchEnd(browser, { changedTouches: [{ clientX: 100, clientY: 105 }] });
    expect(screen.getByRole('img')).toHaveAttribute('src', 'second.webp');
    fireEvent.touchStart(browser, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchEnd(browser, { changedTouches: [{ clientX: 170, clientY: 250 }] });
    expect(screen.getByRole('img')).toHaveAttribute('src', 'second.webp');
  });

  it('does not show a residence price or room ID before selection', () => {
    render(<RoomBookingSidebar residence={moveinn} selectedId={null} />);
    expect(screen.getByRole('heading')).toHaveTextContent('Select a Room to Continue');
    expect(screen.queryByText('$375')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Book Now' })).not.toHaveAttribute('data-room-id');
  });

  it('uses the selected room actual price, deposit and ID while preserving disconnected booking', () => {
    const { rerender } = render(<RoomBookingSidebar residence={moveinn} selectedId="quadruple-70" />);
    const sidebar = screen.getByRole('complementary');
    expect(within(sidebar).getByText('$375')).toBeInTheDocument();
    expect(within(sidebar).getByText('$750')).toBeInTheDocument();
    expect(within(sidebar).getByRole('button', { name: 'Book Now' })).toHaveAttribute('data-room-id', 'quadruple-70');
    expect(within(sidebar).getByRole('button', { name: 'Book Now' })).toBeDisabled();
    const residence: Residence = { ...moveinn, rooms: [...moveinn.rooms, { id: 'second', type: 'single', occupancy: 1, image: 'second.webp', price: 520, deposit: 900, availability: 'available', amenities: [] }] };
    rerender(<RoomBookingSidebar residence={residence} selectedId="second" />);
    expect(within(sidebar).getByRole('heading')).toHaveTextContent('Single Room');
    expect(within(sidebar).getByText('$520')).toBeInTheDocument();
    expect(within(sidebar).getByText('$900')).toBeInTheDocument();
    expect(within(sidebar).queryByText('$375')).not.toBeInTheDocument();
    expect(within(sidebar).getByRole('button', { name: 'Book Now' })).toHaveAttribute('data-room-id', 'second');
  });
});