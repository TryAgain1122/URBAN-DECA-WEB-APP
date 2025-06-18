import dbConnect, { connectToPostgres } from "@/backend/config/dbConnect";
import {
  getRoomDetails,
  updateRoom,
} from "@/backend/controllers/roomControllers";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";

interface RequestContext {
  params: {
    id: string;
  };
}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.get(async (req, ctx) => {
    try {
        await connectToPostgres();
        return await getRoomDetails(req,ctx);
    } catch (error) {
        return new NextResponse("Database Connection Failed", { status: 500});
    }
})

// router.get(getRoomDetails);

export async function GET(request: NextRequest, ctx: RequestContext): Promise<NextResponse> {
  return router.run(request, ctx) as Promise<NextResponse>;
}
