import { rejectBooking } from "@/backend/controllers/bookingControllers";
import { isAuthenticatedUser, authorizeRoles } from "@/backend/middlewares/auth";
import { connectToPostgres } from "@/backend/config/dbConnect";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";

interface RequestContext {
  params: {
    id: string;
  };
}

connectToPostgres();
const router = createEdgeRouter<NextRequest, RequestContext>();

router.use(isAuthenticatedUser);
router.use(authorizeRoles("admin"));
router.put(rejectBooking);

export async function PUT(request: NextRequest, ctx: RequestContext): Promise<NextResponse> {
  return router.run(request, ctx) as Promise<NextResponse>;
}
