import { connectToPostgres } from "@/backend/config/dbConnect";
import { verifyOtp } from "@/backend/controllers/authControllers";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";

interface RequestContext {};

const router = createEdgeRouter<NextRequest, RequestContext>();

connectToPostgres();

router.post(verifyOtp);

export async function POST(req: NextRequest, ctx: RequestContext):Promise<NextResponse> {
    return router.run(req, ctx) as Promise<NextResponse>
}