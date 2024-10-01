import { NextRequest, NextResponse } from "next/server";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors";
import Room from "../models/room";
import User from "../models/user";
import { headers } from "next/headers";
import Booking from "../models/booking";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Genereate stripe checkout session  =>  /api/payment/checkout_session/:roomId
export const stripeCheckoutSession = catchAsyncErrors(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { searchParams } = new URL(req.url);

    const checkInDate = searchParams.get("checkInDate");
    const checkOutDate = searchParams.get("checkOutDate");
    const daysOfStay = searchParams.get("daysOfStay");
    const roomAmount = searchParams.get("amount");

    // Get room details
    const room = await Room.findById(params.id);

    // Create stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      success_url: `${process.env.API_URL}/bookings/me`,
      cancel_url: `${process.env.API_URL}/room/${room?._id}`,
      customer_email: req.user.email,
      client_reference_id: params?.id,
      metadata: { checkInDate, checkOutDate, daysOfStay },
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "php",
            unit_amount: Number(roomAmount) * 100,
            product_data: {
              name: room?.name,
              description: room?.description,
              images: [`${room?.images[0]?.url}`],
            },
          },
          quantity: 1,
        },
      ],
    });

    return NextResponse.json(session);
  }
);

// Create new booking after payment  =>  /api/payment/webhook
export const webhookCheckout = async (req: NextRequest) => {
  try {
    const rawBody = await req.text();
    const signature = headers().get("Stripe-Signature");

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const room = session.client_reference_id;
      const user = (await User.findOne({ email: session?.customer_email })).id;

      const amountPaid = session?.amount_total / 100;

      const paymentInfo = {
        id: session.payment_intent,
        status: session.payment_status,
      };

      const checkInDate = session.metadata.checkInDate;
      const checkOutDate = session.metadata.checkOutDate;
      const daysOfStay = session.metadata.daysOfStay;

      await Booking.create({
        room,
        user,
        checkInDate,
        checkOutDate,
        daysOfStay,
        amountPaid,
        paymentInfo,
        paidAt: Date.now(),
      });

      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    console.log("Eror in stripe checkout webhook => ", error);
    return NextResponse.json({ errMessage: error?.message });
  }
};

// import { NextRequest, NextResponse } from "next/server";
// import { catchAsyncErrors } from "../middlewares/catchAsyncErrors";
// import Room from "../models/room";
// import User from "../models/user";
// import { headers } from "next/headers";
// import Booking from "../models/booking";
// import axios from 'axios'

// const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

// // Generate PayMongo checkout session => /api/payment/checkout_session/:roomId
// export const paymongoCheckoutSession = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     const { searchParams } = new URL(req.url);

//     const checkInDate = searchParams.get("checkInDate");
//     const checkOutDate = searchParams.get("checkOutDate");
//     const daysOfStay = searchParams.get("daysOfStay");
//     const roomAmount = searchParams.get("amount");

//     // Get room details
//     const room = await Room.findById(params.id);

//     // Create PayMongo payment intent
//     const paymentIntentResponse = await axios.post(
//       "https://api.paymongo.com/v1/payment_intents",
//       {
//         data: {
//           attributes: {
//             amount: Number(roomAmount) * 100, // PayMongo accepts amount in centavos
//             payment_method_allowed: ["card", "gcash"], // Allow card and GCash payments
//             currency: "PHP",
//             description: `Payment for room ${room?.name}`,
//             metadata: {
//               checkInDate,
//               checkOutDate,
//               daysOfStay,
//               room_id: params.id,
//               email: req.user.email,
//             },
//           },
//         },
//       },
//       {
//         headers: {
//           Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET_KEY as string).toString(
//             "base64"
//           )}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const paymentIntent = paymentIntentResponse.data.data;

//     return NextResponse.json({
//       client_key: paymentIntent.attributes.client_key,
//       payment_intent_id: paymentIntent.id,
//     });
//   }
// );
