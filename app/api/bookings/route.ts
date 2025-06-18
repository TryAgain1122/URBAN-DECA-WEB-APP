import dbConnect, { connectToPostgres } from "@/backend/config/dbConnect";
import { newBooking } from "@/backend/controllers/bookingControllers";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";

interface RequestContext {}

const router = createEdgeRouter<NextRequest, RequestContext>();

connectToPostgres();

router.use(isAuthenticatedUser).post(newBooking);

export async function POST(request: NextRequest, ctx: RequestContext):Promise<NextResponse> {
  return router.run(request, ctx) as Promise<NextResponse>;
}