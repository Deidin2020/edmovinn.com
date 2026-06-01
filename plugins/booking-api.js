import createBookingApi from '@/services/BookingApiService';

export default ({ $axios }, inject) => {
    inject('bookingApi', createBookingApi($axios));
};
