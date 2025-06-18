import { connectToPostgres } from "@/backend/config/dbConnect";
import { allRooms } from "@/backend/controllers/roomControllers";
import { createEdgeRouter } from "next-connect";
import { NextRequest, NextResponse } from "next/server";

interface RequestContext {
    params: {
        id: string;
    }
}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.get(async (req, ctx) => {
    try {
        await connectToPostgres();
        return await allRooms(req,ctx);
    } catch (error) {
        return new NextResponse("Database Connection Failed", { status: 500});
    }
})

export async function GET(req: NextRequest, ctx: RequestContext):Promise<NextResponse> {
    return router.run(req, ctx) as Promise<NextResponse>
}

// import { NextRequest, NextResponse } from "next/server";
// import { createEdgeRouter } from 'next-connect'
// import dbConnect from "@/backend/config/dbConnect";
// import { allRooms } from "@/backend/controllers/roomControllers";
// import { authorizeRoles, isAuthenticatedUser } from "@/backend/middlewares/auth";

// interface RequestContext {
//     params: {
//         id: string
//     }
// }

// const router = createEdgeRouter<NextRequest, RequestContext>()

// dbConnect();

// router.get(allRooms)

// export async function GET(req: NextRequest, ctx: RequestContext): Promise<NextResponse> {
//     return router.run(req, ctx) as Promise<NextResponse>;
// }
