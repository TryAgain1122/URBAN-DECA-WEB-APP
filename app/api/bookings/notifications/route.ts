import { connectToPostgres } from "@/backend/config/dbConnect";
import { getUserNotifications } from "@/backend/controllers/bookingControllers";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";

interface RequestContext {}

const router = createEdgeRouter<NextRequest, RequestContext>();

connectToPostgres();

router.use(isAuthenticatedUser).get(getUserNotifications);

export async function GET(req: NextRequest, ctx: RequestContext):Promise<NextResponse> {
    return router.run(req, ctx) as Promise<NextResponse>;
}