import dbConnect from "@/backend/config/dbConnect";
import { paypalCheckoutSession } from "@/backend/controllers/paymentControllers";
import { isAuthenticatedUser } from "@/backend/middlewares/auth";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";

interface RequestContext {}

const router = createEdgeRouter<NextRequest, RequestContext>();
dbConnect();

export async function GET(request: NextRequest, ctx: RequestContext): Promise<NextResponse> {
    return router.run(request, ctx) as Promise<NextResponse>;
}
router.use(isAuthenticatedUser).get(paypalCheckoutSession);

// export async function GET(request: NextRequest, ctx: RequestContext): Promise<NextResponse> {
//     return router.run(request, ctx) as Promise<NextResponse>;
// }

// router.use(isAuthenticatedUser).get(stripeCheckoutSession);