import { IBooking } from "@/types/booking";

export const invoiceTemplate = (booking: IBooking) => {
  const {
    user,
    id,
    amount_paid,
    check_in_date,
    check_out_date,
    days_of_stay,
    room,
    payment_info,
    paid_at,
  } = booking;

  return `
    <div style="display: flex, justify-content: center font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #ddd;">
      <h2 style="text-align: center; margin: auto color: #e53935;">Urban Deca Tower Booking Invoice</h2>

      <p><strong>Date:</strong> ${new Date(paid_at).toLocaleDateString()}</p>
      <p><strong>To:</strong> ${user.name} (${user.email})</p>
      <p><strong>Booking ID:</strong> ${id}</p>

      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td style="padding: 8px;">Room</td>
          <td style="padding: 8px;">${room?.name || "N/A"}</td>
        </tr>
        <tr>
          <td style="padding: 8px;">Check-in</td>
          <td style="padding: 8px;">${new Date(check_in_date).toLocaleDateString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px;">Check-out</td>
          <td style="padding: 8px;">${new Date(check_out_date).toLocaleDateString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px;">Days of Stay</td>
          <td style="padding: 8px;">${days_of_stay}</td>
        </tr>
        <tr>
          <td style="padding: 8px;">Payment Status</td>
          <td style="padding: 8px;">${payment_info.status}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Amount Paid</td>
          <td style="padding: 8px; font-weight: bold;">₱ ${Number(amount_paid).toFixed(2)}</td>
        </tr>
      </table>

      <p style="margin-top: 30px;">Thank you for booking with us. We look forward to your stay!</p>

      <p style="text-align: center; font-size: 12px; color: #999;">
        This is an automated invoice. No reply is required.
      </p>
    </div>
  `;
};