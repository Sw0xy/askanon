import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
const defaultReplySelect = Prisma.validator<Prisma.ReplySelect>()({
  id: true,
  text: true,
  createdAt: true,
  postId: true,
  authorId: true,
  author: true,
});

export const replyRouter = createTRPCRouter({
  getReplies: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish().optional(),
        cursor: z.string().nullish().optional(),
        postId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 50;
      const { cursor, postId } = input;

      const items = await ctx.prisma.reply.findMany({
        select: defaultReplySelect,

        take: limit + 1,
        where: {
          postId,
        },
        cursor: cursor
          ? {
              id: cursor,
            }
          : undefined,
        orderBy: {
          updatedAt: "desc",
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const nextItem = items.pop()!;
        nextCursor = nextItem.id;
      }

      return {
        items: items.reverse(),
        nextCursor,
        count: items.length,
      };
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      await ctx.prisma.reply.delete({
        where: {
          id,
        },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        postId: z.string(),

        text: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { text, postId } = input;
      await ctx.prisma.reply.create({
        data: {
          postId,
          authorId: ctx.session.user.id,
          text,
        },
      });
    }),
});
