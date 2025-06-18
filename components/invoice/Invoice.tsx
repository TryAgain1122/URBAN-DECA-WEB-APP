"use client";

import React from "react";

import "./Invoice.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { IBooking } from "@/types/booking";

interface Props {
  data: {
    booking: IBooking;
  };
}

const Invoice = ({ data }: Props) => {
  const booking = data?.booking;

  const handleDownload = () => {
    const input = document.getElementById("booking_invoice");
    if (input) {
      html2canvas(input).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF();
        const pdfWidth = pdf.internal.pageSize.getWidth();
        pdf.addImage(imgData, 0, 0, pdfWidth, 0);
        pdf.save(`invoice_${booking?.id}.pdf`);
      });
    }
  };

  return (
    <div className="container">
      <div className="order-invoice my-5">
        <div className="flex justify-center flex-row mb-5">
          <button className="btn btn-success col-md-5" onClick={handleDownload}>
            <i className="fa fa-print"></i> Download Invoice
          </button>
        </div>
        <div className="px-5">
          <div id="booking_invoice" className="px-4 border border-secondary">
            <header className="clearfix">
              <div id="logo" className="my-4">
                <img src="/images/logo.png" />
              </div>
              <h1>Transaction ID # {booking?.id as string}</h1>
              <div id="company" className="clearfix">
                <div>Urban Deca Tower</div>
                <div>
                  69 Sierra Madre,
                  <br />
                  Mandaluyong City
                </div>
                <div>(602) 519-0450</div>
                <div>
                  <a href="mailto:info@bookit.com">urbandeca@gmail.com</a>
                </div>
              </div>
              <div id="project">
                <div>
                  <span>Name</span> {booking?.user?.name}
                </div>
                <div>
                  <span>EMAIL</span> {booking?.user?.email}
                </div>
                <div>
                  <span>DATE</span>{" "}
                  {new Date(booking?.created_at).toLocaleString("en-US")}
                </div>
                <div>
                  <span>Status</span>{" "}
                  {booking?.payment_info?.status?.toUpperCase()}
                </div>
              </div>
            </header>
            <main>
              <table className="mt-5">
                <thead>
                  <tr>
                    <th className="service">Room</th>
                    <th className="desc">Price Per Night</th>
                    <th>Check In Date</th>
                    <th>Check Out Date</th>
                    <th>Days of Stay</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="service">{booking?.room?.name}</td>
                    <td className="desc">₱{booking?.room?.price_per_night}</td>
                    <td className="unit">
                      {new Date(booking?.check_in_date).toLocaleString("en-PH")}
                    </td>
                    <td className="qty">
                      {new Date(booking?.check_out_date).toLocaleString("en-PH")}
                    </td>
                    <td className="qty">{booking?.days_of_stay}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="grand total">
                      <b>GRAND TOTAL</b>
                    </td>
                    <td className="grand total">₱{booking?.amount_paid}</td>
                  </tr>
                </tbody>
              </table>
              <div id="notices">
                <div>NOTICE:</div>
                <div className="notice">
                  A finance charge of 1.5% will be made on unpaid balances after
                  30 days.
                </div>
              </div>
            </main>
            <footer className="pb-5">
              Invoice was created on a computer and is valid without the
              signature.
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
