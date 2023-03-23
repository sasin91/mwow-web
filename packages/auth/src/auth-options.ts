import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { User, type DefaultSession, type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@acme/db";
import bcrypt from 'bcryptjs';

/**
 * Module augmentation for `next-auth` types
 * Allows us to add custom properties to the `session` object
 * and keep type safety
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/
declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            // ...other properties
            // role: UserRole;
        } & DefaultSession["user"];
    }

    // interface User {
    //   // ...other properties
    //   // role: UserRole;
    // }
}

/**
 * Options for NextAuth.js used to configure
 * adapters, providers, callbacks, etc.
 * @see https://next-auth.js.org/configuration/options
 **/
export const authOptions: NextAuthOptions = {
    callbacks: {
        session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
                // session.user.role = user.role; <-- put other properties on the session here
            }
            return session;
        },
    },
    adapter: PrismaAdapter(prisma),
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID as string,
            clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
        }),
        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "Credentials",
            // `credentials` is used to generate a form on the sign in page.
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                const userWithPassword = await prisma.user.findUnique({
                    where: { email: credentials!.email },
                    include: {
                        password: true,
                    },
                });

                if (!userWithPassword || !userWithPassword.password) {
                    return null;
                  }

                if (userWithPassword && bcrypt.compareSync(credentials!.password, userWithPassword.password.hash)) {
                    return userWithPassword;
                }

                throw new Error("Invalid username or password")
            }
        })
        /**
         * ...add more providers here
         *
         * Most other providers require a bit more work than the Discord provider.
         * For example, the GitHub provider requires you to add the
         * `refresh_token_expires_in` field to the Account model. Refer to the
         * NextAuth.js docs for the provider you want to use. Example:
         * @see https://next-auth.js.org/providers/github
         **/
    ],
};
