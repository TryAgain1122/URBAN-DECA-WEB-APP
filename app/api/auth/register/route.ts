import dbConnect, { connectToPostgres } from "@/backend/config/dbConnect";
import { registerUser } from "@/backend/controllers/authControllers";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";

interface RequestContext {}

const router = createEdgeRouter<NextRequest, RequestContext>();

// dbConnect()
connectToPostgres();

router.post(registerUser);

export async function POST(request: NextRequest, ctx: RequestContext): Promise<NextResponse> {
    return router.run(request, ctx) as Promise<NextResponse>;
}
