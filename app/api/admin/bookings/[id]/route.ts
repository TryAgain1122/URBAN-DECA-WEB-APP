import dbConnect from "@/backend/config/dbConnect";
import { deleteBooking } from "@/backend/controllers/bookingControllers";
import {
  authorizeRoles,
  isAuthenticatedUser,
} from "@/backend/middlewares/auth";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";

interface RequestContext {
  params: {
    id: string;
  };
}

const router = createEdgeRouter<NextRequest, RequestContext>();

dbConnect();

router.use(isAuthenticatedUser, authorizeRoles("admin")).delete(deleteBooking);

export async function DELETE(request: NextRequest, ctx: RequestContext) {
  try {
    // Run the router and execute the request
    await router.run(request, ctx);

    // Return a success response after the booking is deleted
    return NextResponse.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    // In case of error, return an error response
    return NextResponse.json({ success: false, message: 'Failed to delete booking' }, { status: 500 });
  }
}
