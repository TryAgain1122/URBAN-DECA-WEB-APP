import dbConnect from "@/backend/config/dbConnect";
import { confirmBooking } from "@/backend/controllers/bookingControllers";
import { isAuthenticatedUser, authorizeRoles } from "@/backend/middlewares/auth";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";

interface RequestContext {
  params: {
    id: string;
  };
}

const router = createEdgeRouter<NextRequest, RequestContext>();
dbConnect();

router.use(isAuthenticatedUser);
router.use(authorizeRoles("admin")); // Only admin can approve/reject
router.put(confirmBooking);

export async function PUT(request: NextRequest, ctx: RequestContext): Promise<NextResponse> {
  return router.run(request, ctx) as Promise<NextResponse>;
}