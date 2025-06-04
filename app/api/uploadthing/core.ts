import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./route";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
}); 