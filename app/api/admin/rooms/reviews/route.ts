import dbConnect, { connectToPostgres } from "@/backend/config/dbConnect";
import { allAdminRooms, deleteRoomReview, getRoomReviews, newRoom } from "@/backend/controllers/roomControllers";
import {
  authorizeRoles,
  isAuthenticatedUser,
} from "@/backend/middlewares/auth";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";

interface RequestContext {}

const router = createEdgeRouter<NextRequest, RequestContext>();

connectToPostgres();

router.use(isAuthenticatedUser, authorizeRoles("admin")).get(getRoomReviews);
router.use(isAuthenticatedUser, authorizeRoles("admin")).delete(deleteRoomReview);

export async function GET(request: NextRequest, ctx: RequestContext): Promise<NextResponse> {
  return router.run(request, ctx) as Promise<NextResponse>;
}

export async function DELETE(request: NextRequest, ctx: RequestContext): Promise<NextResponse> {
  return router.run(request, ctx) as Promise<NextResponse>;
}