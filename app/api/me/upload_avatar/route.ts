import dbConnect, { connectToPostgres } from "@/backend/config/dbConnect";
import { uploadAvatar } from "@/backend/controllers/authControllers";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";


interface RequestContext {}

const router = createEdgeRouter<NextRequest, RequestContext>();

connectToPostgres();

router.use(isAuthenticatedUser).put(uploadAvatar);

export async function PUT(request: NextRequest, ctx: RequestContext): Promise<NextResponse> {
    return router.run(request, ctx) as Promise<NextResponse>;
}