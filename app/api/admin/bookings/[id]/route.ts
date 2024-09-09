import dbConnect from "@/backend/config/dbConnect";
import { deleteBooking } from "@/backend/controllers/bookingControllers";
import {
  authorizeRoles,
  isAuthenticatedUser,
} from "@/backend/middlewares/auth";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";

interface RequestContext {
  params: {
    id: string;
  };
}

const router = createEdgeRouter<NextRequest, RequestContext>();

dbConnect();

router.use(isAuthenticatedUser, authorizeRoles("admin")).delete(deleteBooking);

export async function DELETE(request: NextRequest, ctx: RequestContext) {
  return router.run(request, ctx);
}

// import dbConnect from "@/backend/config/dbConnect";
// import { deleteBooking } from "@/backend/controllers/bookingControllers";
// import {
//   authorizeRoles,
//   isAuthenticatedUser,
// } from "@/backend/middlewares/auth";
// import { createEdgeRouter } from "next-connect";
// import { NextRequest, NextResponse } from "next/server";

// interface RequestContext {
//   params: {
//     id: string;
//   };
// }

// const router = createEdgeRouter<NextRequest, RequestContext>();

// dbConnect();

// router.use(isAuthenticatedUser, authorizeRoles("admin")).delete(async (req, res) => {
//   try {
//     // Now you access the ID from ctx.params, not from req.params
//     const bookingId = res.params?.id; // Ensure you're using `res.params`
//     if (!bookingId) {
//       return NextResponse.json({ success: false, message: "Booking ID is required" }, { status: 400 });
//     }

//     const result = await deleteBooking(req, {id :bookingId});

//     if (!result) {
//       return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
//     }

//     return NextResponse.json({ success: true, message: "Booking deleted successfully" });
//   } catch (error) {
//     return NextResponse.json({ success: false, message: "Error deleting booking" }, { status: 500 });
//   }
// });

// export async function DELETE(request: NextRequest, ctx: RequestContext) {
//   try {
//     // Pass the ctx to the router so params are accessible
//     const response = await router.run(request, ctx);
//     return response;
//   } catch (error) {
//     return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
//   }
// }
