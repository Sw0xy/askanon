import { createTRPCRouter } from "~/server/api/trpc";
import { postRouter } from "./routers/post";
import { replyRouter } from "./routers/reply";
import { userRouter } from "./routers/user";
import { imageRouter } from "./routers/image";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  post: postRouter,
  reply: replyRouter,
  image: imageRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
