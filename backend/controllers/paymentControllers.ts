import { NextRequest, NextResponse } from "next/server";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors";
import User from "../models/user";
import Room from '../models/room';
import axios from "axios";
import db from "../config/dbConnect"
import Booking from '../models/booking'
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// // Genereate stripe checkout session  =>  /api/payment/checkout_session/:roomId
// export const stripeCheckoutSession = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     const { searchParams } = new URL(req.url);

//     const checkInDate = searchParams.get("checkInDate");
//     const checkOutDate = searchParams.get("checkOutDate");
//     const daysOfStay = searchParams.get("daysOfStay");
//     const roomAmount = searchParams.get("amount");

//     // Get room details
//     const room = await Room.findById(params.id);

//     // Create stripe checkout session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       success_url: `${process.env.API_URL}/bookings/me`,
//       cancel_url: `${process.env.API_URL}/room/${room?._id}`,
//       customer_email: req.user.email,
//       client_reference_id: params?.id,
//       metadata: { checkInDate, checkOutDate, daysOfStay },
//       mode: "payment",
//       line_items: [
//         {
//           price_data: {
//             currency: "php",
//             unit_amount: Number(roomAmount) * 100,
//             product_data: {
//               name: room?.name,
//               description: room?.description,
//               images: [`${room?.images[0]?.url}`],
//             },
//           },
//           quantity: 1,
//         },
//       ],
//     });

//     return NextResponse.json(session);
//   }
// );

// // Create new booking after payment  =>  /api/payment/webhook
// export const webhookCheckout = async (req: NextRequest) => {
//   try {
//     const rawBody = await req.text();
//     const signature = headers().get("Stripe-Signature");

//     const event = stripe.webhooks.constructEvent(
//       rawBody,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );

//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;

//       const room = session.client_reference_id;
//       const user = (await User.findOne({ email: session?.customer_email })).id;

//       const amountPaid = session?.amount_total / 100;

//       const paymentInfo = {
//         id: session.payment_intent,
//         status: session.payment_status,
//       };

//       const checkInDate = session.metadata.checkInDate;
//       const checkOutDate = session.metadata.checkOutDate;
//       const daysOfStay = session.metadata.daysOfStay;

//       await Booking.create({
//         room,
//         user,
//         checkInDate,
//         checkOutDate,
//         daysOfStay,
//         amountPaid,
//         paymentInfo,
//         paidAt: Date.now(),
//       });

//       return NextResponse.json({ success: true });
//     }
//   } catch (error: any) {
//     console.log("Eror in stripe checkout webhook => ", error);
//     return NextResponse.json({ errMessage: error?.message });
//   }
// };

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET_KEY;
const PAYPAL_API = process.env.PAYPAL_API;
// const pool = db.pool

// export const paypalCheckoutSession = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     const { searchParams } = new URL(req.url);

//     const checkInDate = searchParams.get("checkInDate");
//     const checkOutDate = searchParams.get("checkOutDate");
//     const daysOfStay = searchParams.get("daysOfStay");
//     const roomAmount = searchParams.get("amount");

//     // Get room details
//     const room = await Room.findById(params.id);
//     if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

//     // ✅ Get PayPal access token
//     const tokenResponse = await axios.post(
//       `${PAYPAL_API}/v1/oauth2/token`,
//       "grant_type=client_credentials",
//       {
//         auth: {
//           username: PAYPAL_CLIENT_ID!,
//           password: PAYPAL_SECRET!,
//         },
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       }
//     );

//     const accessToken = tokenResponse.data.access_token;

//     // ✅ Create PayPal order
//     const orderResponse = await axios.post(
//       `${PAYPAL_API}/v2/checkout/orders`,
//       {
//         intent: "CAPTURE",
//         purchase_units: [
//           {
//             reference_id: params.id,
//             amount: {
//               currency_code: "PHP",
//               value: roomAmount,
//             },
//             description: `Booking for ${room.name}`,
//             custom_id: `${checkInDate}|${checkOutDate}|${daysOfStay}`,
//           },
//         ],
//         application_context: {
//           return_url: `${process.env.API_URL}/bookings/me`,
//           cancel_url: `${process.env.API_URL}/room/${room._id}`,
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     return NextResponse.json(orderResponse.data);
//   }
// );

// ✅ HANDLE PAYPAL WEBHOOK
// export const webhookCheckout = async (req: NextRequest) => {
//   try {
//     const event = await req.json();
//     console.log("✅ PayPal Webhook Event:", event);

//     // ✅ Correct event type
//     if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
//       const capture = event.resource;

//       const userEmail = capture?.payer?.email_address;
//       if (!userEmail) {
//         console.warn("⚠️ Missing user email");
//         return NextResponse.json({ success: false, message: "User email missing" });
//       }

//       const user = await User.findOne({ email: userEmail });
//       if (!user) {
//         console.warn("⚠️ User not found:", userEmail);
//         return NextResponse.json({ success: false, message: "User not found" });
//       }

//       // ✅ Trace back the order
//       const orderId = capture?.supplementary_data?.related_ids?.order_id;
//       if (!orderId) {
//         console.warn("⚠️ Missing order ID in capture");
//         return NextResponse.json({ success: false, message: "Missing order ID" });
//       }

//       // Optional: fetch order details from PayPal (if you need custom_id / reference_id)
//       const tokenResponse = await axios.post(
//         `${PAYPAL_API}/v1/oauth2/token`,
//         "grant_type=client_credentials",
//         {
//           auth: {
//             username: PAYPAL_CLIENT_ID!,
//             password: PAYPAL_SECRET!,
//           },
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//           },
//         }
//       );

//       const accessToken = tokenResponse.data.access_token;

//       const orderResponse = await axios.get(
//         `${PAYPAL_API}/v2/checkout/orders/${orderId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );

//       const purchaseUnit = orderResponse.data.purchase_units?.[0];
//       if (!purchaseUnit) {
//         return NextResponse.json({ success: false, message: "No purchase unit found" });
//       }

//       const room = purchaseUnit.reference_id;
//       const amountPaid = purchaseUnit.amount.value;
//       const [checkInDate, checkOutDate, daysOfStay] =
//         purchaseUnit.custom_id?.split("|") || [];

//       await Booking.create({
//         room,
//         user: user._id,
//         checkInDate,
//         checkOutDate,
//         daysOfStay,
//         amountPaid,
//         paymentInfo: {
//           id: capture.id,
//           status: capture.status,
//         },
//         paidAt: Date.now(),
//         status: "confirmed",
//         cancellationConfirmed: false,
//       });

//       console.log("✅ Booking created successfully");
//       return NextResponse.json({ success: true });
//     }

//     return NextResponse.json({ success: false, message: "Event type not handled" });
//   } catch (error: any) {
//     console.error("❌ Error in PayPal webhook:", error.message);
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// };


// export const webhookCheckout = async (req: NextRequest) => {
//   try {
//     const event = await req.json();
//     console.log("✅ PayPal Webhook Event:", event);

//     // 💡 Make sure you're listening for COMPLETED, not just APPROVED
//     if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
//       const order = event.resource;

//       const userEmail = order.payer?.email_address;
//       if (!userEmail) return NextResponse.json({ success: false, message: "User email missing" });

//       const user = await User.findOne({ email: userEmail });
//       if (!user) return NextResponse.json({ success: false, message: "User not found" });

//       const purchaseUnit = order.purchase_units?.[0];
//       if (!purchaseUnit) return NextResponse.json({ success: false, message: "No purchase unit" });

//       const room = purchaseUnit.reference_id;
//       const amountPaid = purchaseUnit.amount.value;
//       const [checkInDate, checkOutDate, daysOfStay] =
//         purchaseUnit.custom_id?.split("|") || [];

//       await Booking.create({
//         room,
//         user: user._id,
//         checkInDate,
//         checkOutDate,
//         daysOfStay,
//         amountPaid,
//         paymentInfo: {
//           id: order.id,
//           status: order.status,
//         },
//         paidAt: Date.now(),
//       });

//       console.log("✅ Booking created successfully");
//       return NextResponse.json({ success: true });
//     }

//     return NextResponse.json({ success: false, message: "Event type not handled" });
//   } catch (error: any) {
//     console.error("❌ Error in PayPal webhook:", error.message);
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// };

//Generate PAypal Checkout Session  => /api/payment/checkout_session/:roomId
export const paypalCheckoutSession = catchAsyncErrors(
  async (req: NextRequest, { params }: { params: { id: string}}) => {
    const { searchParams } = new URL(req.url);

    const checkInDate = searchParams.get("checkInDate");
    const checkOutDate = searchParams.get("checkOutDate");
    const daysOfStay = searchParams.get("daysOfStay");
    const roomAmount = searchParams.get("amount");

    // Get room Details 
    const room = await Room.findById(params.id);

    // Gety Paypal Access token 
    const tokenResponse = await axios.post(
      `${PAYPAL_API}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        auth: {
          username: PAYPAL_CLIENT_ID!,
          password: PAYPAL_SECRET!,
        },
        headers: {
          "Content-Type":  "application/x-www-form-urlencoded",
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    //create paypal order 
    const orderResponse = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: params.id,
            amount: {
              currency_code: "PHP",
              value: roomAmount,
            },
            description: `Booking for ${room?.name}`,
            custom_id: `${checkInDate}|${checkOutDate}|${daysOfStay}`,
          }
        ],
        application_context: {
          return_url: `${process.env.API_URL}/bookings/me`,
          cancel_url: `${process.env.API_URL}/room/${room?._id}`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return NextResponse.json(orderResponse.data)
  }
);

// Create new Booking after payment => /api/payment/webhook
export const webhookCheckout = async (req: NextRequest) => {
  try {
    const event = await req.json();
    console.log("Paypal Webhook Event:", event);

    if (event.event_type === "CHECKOUT.ORDER.APPROVED") {
      const order = event.resource;
      const user = await User.findOne({ email: order.payer.email_address });
      if (!user) return NextResponse.json({ success: false})

        const room = order.purchase_units[0].reference_id;
        const amountPaid = order.purchase_units[0].amount.value;
        const metadata = order.purchase_units[0].custom_id?.split("|") || [];
        const [checkInDate, checkOutDate, daysOfStay] = metadata;
  
        await Booking.create({
          room,
          user: user.id,
          checkInDate,
          checkOutDate,
          daysOfStay,
          amountPaid,
          paymentInfo: {
            id: order.id,
            status: order.status,
          },
          paidAt: Date.now(),
        });

        console.log("✅ Booking created successfully");
        return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    console.error("❌ Error in PayPal webhook:", error);
    return NextResponse.json({ errMessage: error?.message })
  }
}



//PostgreSql

// CREATE PAYPAL ORDER SESSION
// export const paypalCheckoutSession = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     const { searchParams } = new URL(req.url);

//     const checkInDate = searchParams.get("checkInDate");
//     const checkOutDate = searchParams.get("checkOutDate");
//     const daysOfStay = searchParams.get("daysOfStay");
//     const roomAmount = searchParams.get("amount");

//     // ✅ Get room details from PostgreSQL
//     const roomRes = await pool.query("SELECT * FROM rooms WHERE id = $1", [params.id]);
//     if (roomRes.rows.length === 0) {
//       return NextResponse.json({ error: "Room not found" }, { status: 404 });
//     }

//     const room = roomRes.rows[0];

//     // ✅ Get PayPal access token
//     const tokenResponse = await axios.post(
//       `${PAYPAL_API}/v1/oauth2/token`,
//       "grant_type=client_credentials",
//       {
//         auth: {
//           username: PAYPAL_CLIENT_ID!,
//           password: PAYPAL_SECRET!,
//         },
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       }
//     );

//     const accessToken = tokenResponse.data.access_token;

//     // ✅ Create PayPal order
//     const orderResponse = await axios.post(
//       `${PAYPAL_API}/v2/checkout/orders`,
//       {
//         intent: "CAPTURE",
//         purchase_units: [
//           {
//             reference_id: params.id,
//             amount: {
//               currency_code: "PHP",
//               value: roomAmount,
//             },
//             description: `Booking for ${room.name}`,
//             custom_id: `${checkInDate}|${checkOutDate}|${daysOfStay}`,
//           },
//         ],
//         application_context: {
//           return_url: `${process.env.API_URL}/bookings/me`,
//           cancel_url: `${process.env.API_URL}/room/${room.id}`,
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     return NextResponse.json(orderResponse.data);
//   }
// );

// // ✅ HANDLE PAYPAL WEBHOOK
// export const webhookCheckout = async (req: NextRequest) => {
//   try {
//     const event = await req.json();
//     console.log("✅ PayPal Webhook Event:", event);

//     if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
//       const capture = event.resource;

//       const userEmail = capture?.payer?.email_address;
//       if (!userEmail) {
//         return NextResponse.json({ success: false, message: "User email missing" });
//       }

//       // ✅ Get user from PostgreSQL
//       const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [userEmail]);
//       if (userRes.rows.length === 0) {
//         return NextResponse.json({ success: false, message: "User not found" });
//       }

//       const userId = userRes.rows[0].id;

//       // ✅ Get PayPal access token again
//       const tokenResponse = await axios.post(
//         `${PAYPAL_API}/v1/oauth2/token`,
//         "grant_type=client_credentials",
//         {
//           auth: {
//             username: PAYPAL_CLIENT_ID!,
//             password: PAYPAL_SECRET!,
//           },
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//           },
//         }
//       );

//       const accessToken = tokenResponse.data.access_token;

//       // ✅ Fetch order details
//       const orderId = capture?.supplementary_data?.related_ids?.order_id;
//       const orderResponse = await axios.get(
//         `${PAYPAL_API}/v2/checkout/orders/${orderId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );

//       const purchaseUnit = orderResponse.data.purchase_units?.[0];
//       const roomId = purchaseUnit.reference_id;
//       const amountPaid = purchaseUnit.amount.value;
//       const [checkInDate, checkOutDate, daysOfStay] = (purchaseUnit.custom_id || "").split("|");

//       // ✅ Insert Booking into PostgreSQL
//       await pool.query(
//         `INSERT INTO bookings (
//             room_id, user_id, check_in_date, check_out_date,
//             amount_paid, days_of_stay, payment_id, payment_status,
//             paid_at, status, cancellation_confirmed
//          )
//          VALUES (
//             $1, $2, $3, $4,
//             $5, $6, $7, $8,
//             CURRENT_TIMESTAMP, $9, $10
//          )`,
//         [
//           roomId,
//           userId,
//           checkInDate,
//           checkOutDate,
//           amountPaid,
//           daysOfStay,
//           capture.id,
//           capture.status.toLowerCase(),
//           "confirmed", // default status
//           false,
//         ]
//       );

//       console.log("✅ Booking created in PostgreSQL");
//       return NextResponse.json({ success: true });
//     }

//     return NextResponse.json({ success: false, message: "Event type not handled" });
//   } catch (error: any) {
//     console.error("❌ PayPal Webhook Error:", error.message);
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//   }
// };


