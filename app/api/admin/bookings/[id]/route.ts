import dbConnect, { connectToPostgres } from "@/backend/config/dbConnect";
import { deleteBooking } from "@/backend/controllers/bookingControllers";
import { authorizeRoles, isAuthenticatedUser } from "@/backend/middlewares/auth";
import { createEdgeRouter } from "next-connect"
import { NextRequest, NextResponse } from "next/server"

interface RequestContext {
    params: {
        id: string
    }
}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.use(isAuthenticatedUser, authorizeRoles("admin")).delete(deleteBooking);
connectToPostgres();

export async function DELETE(request:NextRequest, ctx:RequestContext): Promise<NextResponse> {
    return router.run(request, ctx) as Promise <NextResponse>;
}

