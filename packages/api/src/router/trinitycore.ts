import { executeCommand } from '@acme/trinitycore';
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const trinitycoreRouter = createTRPCRouter({
    serverInfo: publicProcedure
        .query(async () => {
            /**
            TrinityCore rev. 43a018863583 2022-12-24 01:07:56 +0000 (master branch) (Win64, Release, Static)
            Online players: 0 (max: 0)
            Active connections: 0 (max: 0) Queued connections: 0 (max: 0)
            Server uptime: 45 Seconds.
            Update time diff: 2.
            **/
            const info = await executeCommand('server info')
            const [server, online, connections, uptime, uptimeDiff] = info!.split('\n');

            return {
                server,
                // serverComponents: {
                //     core: server.split(' ')[1],
                //     revision: server.split(' ')[2],
                //     date: server.split(' ')[3],
                //     time: server.split(' ')[4],
                //     timezone: server.split(' ')[5],
                //     branch: server.split(' ')[6],
                //     platform: server.split(' ')[7],
                //     build: server.split(' ')[8],
                //     static: server.split(' ')[9],
                // },
                online,
                // onlineComponents: {
                //     players: online.split(' ')[2],
                //     max: online.split(' ')[4],
                // },
                connections,
                // connectionsComponents: {
                //     active: connections.split(' ')[2],
                //     max: connections.split(' ')[4],
                //     queued: connections.split(' ')[6],
                //     queuedMax: connections.split(' ')[8],
                // },
                uptime,
                // uptimeComponents: {
                //     uptime: uptime.split(' ')[2],
                //     uptimeUnit: uptime.split(' ')[3],
                // },
                uptimeDiff,
            };
        }),
    delete: publicProcedure.input(z.string()).mutation(({ ctx, input }) => {
        return ctx.prisma.post.delete({ where: { id: input } });
    }),
});
