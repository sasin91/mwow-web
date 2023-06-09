import { trinitycoreRouter } from './router/trinitycore';
import { authRouter } from "./router/auth";
import { postRouter } from "./router/post";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
    post: postRouter,
    auth: authRouter,
    trinitycore: trinitycoreRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
