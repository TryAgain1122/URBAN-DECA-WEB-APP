import { connectToPostgres } from "@/backend/config/dbConnect";
import { sendInvoice } from "@/backend/controllers/bookingControllers";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";

interface RequestContext {}

connectToPostgres();

const router = createEdgeRouter<NextRequest, RequestContext>();
router .post(sendInvoice);

export async function POST(req: NextRequest, ctx: RequestContext): Promise<NextResponse> {
    return router.run(req, ctx) as Promise<NextResponse>
}