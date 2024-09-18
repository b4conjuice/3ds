import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
// import { notes } from '@/server/db/schema'
import { and } from 'drizzle-orm'

export const noteRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      }
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const note = await ctx.db.query.notes.findFirst({
      orderBy: (notes, { desc }) => [desc(notes.createdAt)],
    })

    return note ?? null
  }),
})
