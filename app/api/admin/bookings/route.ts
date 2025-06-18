import dbConnect, { connectToPostgres } from "@/backend/config/dbConnect";
import { allAdminBookings } from "@/backend/controllers/bookingControllers";
import { authorizeRoles, isAuthenticatedUser } from "@/backend/middlewares/auth";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";

interface RequestContext {}

const router = createEdgeRouter<NextRequest, RequestContext>()

router.use(isAuthenticatedUser, authorizeRoles("admin")).get(allAdminBookings)

connectToPostgres();

export async function GET(request: NextRequest, ctx: RequestContext): Promise<NextResponse> {
   return router.run(request, ctx) as Promise<NextResponse> 
}