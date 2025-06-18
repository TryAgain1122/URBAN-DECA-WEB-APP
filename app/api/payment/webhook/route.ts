import dbConnect, { connectToPostgres } from "@/backend/config/dbConnect";
import { webhookCheckout } from "@/backend/controllers/paymentControllers";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";

interface RequestContext {}

const router = createEdgeRouter<NextRequest, RequestContext>();

connectToPostgres();

router.post(webhookCheckout);

export async function POST(request: NextRequest, ctx: RequestContext): Promise<NextResponse> {
    return router.run(request, ctx) as Promise<NextResponse>
}