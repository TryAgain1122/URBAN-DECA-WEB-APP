import { NextRequest, NextResponse } from "next/server";
import { createEdgeRouter } from 'next-connect'
import dbConnect from "@/backend/config/dbConnect";
import { allRooms } from "@/backend/controllers/roomControllers";
import { authorizeRoles, isAuthenticatedUser } from "@/backend/middlewares/auth";

interface RequestContext {
    params: {
        id: string
    }
}

const router = createEdgeRouter<NextRequest, RequestContext>()

dbConnect();

router.get(allRooms)

export async function GET(req: NextRequest, ctx: RequestContext) {
    return router.run(req, ctx)
}