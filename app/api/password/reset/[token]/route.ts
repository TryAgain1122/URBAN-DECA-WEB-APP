import dbConnect, { connectToPostgres } from "@/backend/config/dbConnect";
import { resetPassword } from "@/backend/controllers/authControllers";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";

interface RequestContext {}

const router = createEdgeRouter<NextRequest, RequestContext>();

connectToPostgres();

router.put(resetPassword)

export async function PUT(request: NextRequest, ctx: RequestContext): Promise<NextResponse> {
    return router.run(request, ctx) as Promise<NextResponse>;
}