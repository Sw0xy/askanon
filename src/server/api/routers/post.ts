/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { publicProcedure, createTRPCRouter, protectedProcedure } from "../trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "~/server/db";

const defaultPostSelect = Prisma.validator<Prisma.PostSelect>()({
  id: true,
  text: true,
  createdAt: true,
  author: true,
  updatedAt: true,
  answer: true,
  toUserId: true,
  _count: {
    select: {
      likes: true,
      replies: true,
    },
  },
});

export const postRouter = createTRPCRouter({
  isLiked: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const post = await ctx.prisma.like.findFirst({
        where: {
          postId: id,
          userId: ctx.session.user.id,
        },
      });
      return post;
    }),
  unLike: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const data = await ctx.prisma.like.findFirst({
        where: {
          postId: id,
        },
      });
      await prisma.like.delete({
        where: {
          id: data?.id,
        },
      });
    }),
  like: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      await ctx.prisma.like.create({
        data: {
          postId: id,
          userId: ctx.session.user.id,
        },
      });
    }),
  getUserPosts: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        userId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 50;
      const { cursor, userId } = input;

      const items = await ctx.prisma.post.findMany({
        select: defaultPostSelect,

        take: limit + 1,
        where: {
          toUserId: userId,
          isPublic: true,
        },
        cursor: cursor
          ? {
              id: cursor,
            }
          : undefined,
        orderBy: {
          updatedAt: "asc",
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
  getTimelinePosts: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;

      const items = await ctx.prisma.post.findMany({
        select: defaultPostSelect,

        take: limit + 1,
        where: {
          isPublic: true,
        },
        cursor: cursor
          ? {
              id: cursor,
            }
          : undefined,
        orderBy: {
          id: "desc",
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
  createAnswer: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        answer: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { postId, answer } = input;
      const post = await ctx.prisma.post.update({
        data: {
          answer,
          isPublic: true,
        },
        where: {
          id: postId,
        },
        select: defaultPostSelect,
      });
      return post;
    }),
  getInboxPosts: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 50;

      const items = await ctx.prisma.post.findMany({
        select: {
          id: true,
          text: true,
          createdAt: true,
        },
        take: limit + 1,

        where: {
          toUserId: ctx.session.user.id,
          answer: null,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        items: items.reverse(),
        count: items.length,
      };
    }),
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;

      const items = await ctx.prisma.post.findMany({
        select: defaultPostSelect,

        take: limit + 1,
        where: {},
        cursor: cursor
          ? {
              id: cursor,
            }
          : undefined,
        orderBy: {
          createdAt: "desc",
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
      };
    }),
  byId: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const post = await ctx.prisma.post.findUnique({
        where: { id },
        select: defaultPostSelect,
      });
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No post with id '${id}'`,
        });
      }
      return post;
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      await ctx.prisma.post.delete({
        where: {
          id,
        },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1),
        toUserId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { toUserId, text } = input;
      const post = await ctx.prisma.post.create({
        data: {
          toUserId,
          text,
          authorId: ctx.session?.user.id,
        },
        select: defaultPostSelect,
      });
      return post;
    }),
});
