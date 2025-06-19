import { connectToPostgres } from "@/backend/config/dbConnect";
import { markAllNotificationsAsRead } from "@/backend/controllers/bookingControllers";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";

interface RequestContext {}

const router = createEdgeRouter<NextRequest, RequestContext>();

connectToPostgres();

router.use(isAuthenticatedUser).put(markAllNotificationsAsRead);

export async function PUT(
  req: NextRequest,
  ctx: RequestContext
): Promise<NextResponse> {
  return router.run(req, ctx) as Promise<NextResponse>;
}
