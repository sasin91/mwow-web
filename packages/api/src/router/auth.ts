import { executeCommand } from '@acme/trinitycore';
import { prisma } from "@acme/db";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
    register: publicProcedure
        .input(
            z.object({
                username: z.string().min(1)
                    .refine(async (v) => {
                        return prisma.user.findFirst({ select: { id: true }, where: { username: v } }) !== null;
                    }, { message: "Username already exists." })
                    .refine(async (v) => {
                        const response = await executeCommand(`baninfo account ${v}`);

                        // if the account does not exist, it is not banned and can be created
                        if (response === `Account ${v.toUpperCase()} does not exist.`) {
                            return false;
                        }

                        // otherwise we'll just reject the registration
                        return true;
                    }, { message: "Username is banned." }),
                email: z.string().email().refine(async (v) => {
                    return prisma.user.findFirst({ select: { id: true }, where: { email: v } }) !== null;
                }, { message: "Email already exists." }),
                password: z.string().min(8),
                avatar: z.string().optional(),
            })
        )
        .mutation(async ({ input }) => {
            const user = await prisma.user.create({ data: input });
            const gameAccount = await executeCommand(`account create ${input.username} ${input.password}`);

            return {
                user,
                gameAccount,
            };
        }),
  getSecretMessage: protectedProcedure.query(() => {
    // testing type validation of overridden next-auth Session in @acme/auth package
    return "you can see this secret message!";
  }),
});
