import dbConnect from "@/backend/config/dbConnect";
import { cancelBooking, getBookingDetails } from "@/backend/controllers/bookingControllers";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";


interface RequestContext {}

const router = createEdgeRouter<NextRequest, RequestContext>()
dbConnect();

router.use(isAuthenticatedUser);
router.get(getBookingDetails);
router.put(cancelBooking);

export async function GET(request: NextRequest, ctx: RequestContext) {
    return router.run(request, ctx)
}

export async function PUT(request: NextRequest, ctx: RequestContext) {
    return router.run(request, ctx);
}