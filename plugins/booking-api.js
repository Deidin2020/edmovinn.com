import createBookingApi from '@/services/BookingApiService';

export default ({ $axios, $auth }, inject) => {
    inject('bookingApi', createBookingApi($axios, $auth));
};
