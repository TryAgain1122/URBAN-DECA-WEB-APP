import { deleteBooking } from "@/backend/controllers/bookingControllers";
import { authorizeRoles, isAuthenticatedUser } from "@/backend/middlewares/auth";
import { createEdgeRouter } from "next-connect"
import { NextRequest } from "next/server"

interface RequestContext {
    params: {
        id: string
    }
}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.use(isAuthenticatedUser, authorizeRoles("admin")).delete(deleteBooking);

// export async function DELETE(request:NextRequest, ctx:RequestContext) {
//     return router.run(request, ctx);
// }

export const DELETE = async (request: NextRequest, ctx: RequestContext) => {
  const response = await router.run(request, ctx);
  return response;
}
