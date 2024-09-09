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
    const result = await router.run(request, ctx);
    return result || NextResponse.json({ success: false}, { status: 500});
  } catch (error) {
    return NextResponse.json({error: "Something went wrong"}, {status: 500})
  }
}