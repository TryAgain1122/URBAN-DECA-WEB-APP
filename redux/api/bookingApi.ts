import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const bookingApi = createApi({
  reducerPath: "bookingApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    newBooking: builder.mutation({
      query(body) {
        return {
          url: "/bookings",
          method: "POST",
          body,
        };
      },
    }),
    checkBookingAvailability: builder.query({
      query({ room_id, checkInDate, checkOutDate }) {
        return {
          url: `/bookings/check_room_availability?room_id=${room_id}&check_in_date=${checkInDate}&check_out_date=${checkOutDate}`,
        };
      },
    }),
    getBookedDates: builder.query({
      query(id) {
        return {
          url: `/bookings/booked_dates?room_id=${id}`,
        };
      },
    }),

    paypalCheckout: builder.query({
      query({ id, checkoutData }) {
        return {
          url: `/payment/checkout_session/${id}`,
          params: {
            check_in_date: checkoutData.check_out_date,
            check_out_date: checkoutData.check_out_date,
            days_of_stay: checkoutData.days_of_stay,
            amount: checkoutData.amount,
          },
        };
      },
    }),

    getSalesStats: builder.query({
      query({ startDate, endDate }) {
        return {
          url: `/admin/sales_stats?startDate=${startDate}&endDate=${endDate}`,
        };
      },
    }),
    deleteBooking: builder.mutation({
      query(id) {
        return {
          url: `/admin/bookings/${id}`,
          method: "DELETE",
        };
      },
    }),
    cancelBooking: builder.mutation({
      query(id) {
        return {
          url: `/bookings/${id}/cancel_booking`,
          method: "PUT",
        };
      },
    }),
    updateBookingStatus: builder.mutation({
      query({ id, status }) {
        return {
          url: `/admin/bookings/${id}/status`,
          method: "PUT",
          body: { status },
        };
      },
    }),

    getAdminNotifications: builder.query({
      query: () => ({
        url: "/admin/notifications",
      }),
    }),

    getUserNotifications: builder.query({
      query: () => ({
        url: "/bookings/notifications",
      }),
    }),
 markNotificationsAsRead: builder.mutation({
  query: () => ({
    url: "/bookings/notifications/mark_as_read",
    method: "PUT",
  }),
}),
  }),
});

export const {
  useNewBookingMutation,
  useLazyCheckBookingAvailabilityQuery,
  useGetBookedDatesQuery,
  useLazyPaypalCheckoutQuery,
  useLazyGetSalesStatsQuery,
  useDeleteBookingMutation,
  useCancelBookingMutation,
  useUpdateBookingStatusMutation,
  useGetAdminNotificationsQuery,
  useGetUserNotificationsQuery,
  useMarkNotificationsAsReadMutation,
} = bookingApi;
