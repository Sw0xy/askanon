import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "~/server/db";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
export const defaultUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  avatarUrl: true,
  bannerUrl: true,
  posts: true,
  replies: true,
  createdAt: true,
  _count: {
    select: {
      followers: true,
      following: true,
      posts: true,
      replies: true,
    },
  },
});

export const userRouter = createTRPCRouter({
  getWhoToFollow: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const result = await prisma.user.findMany({
      where: {
        NOT: [
          {
            id: userId,
          },
          {
            followers: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
      take: 5,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    });

    return result;
  }),
  search: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const result = await ctx.prisma.user.findMany({
        where: {
          name: {
            contains: input.name,
          },
        },
        select: {
          name: true,
          avatarUrl: true,
          id: true,
        },
      });

      return result;
    }),
  getIsFollowing: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const user = await ctx.prisma.following.findFirst({
        where: {
          followerId: id,
          userId: ctx.session.user.id,
        },
      });

      return user ? false : true;
    }),
  getFollowingUsers: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const user = await ctx.prisma.user.findMany({
        select: {
          followers: true,
          following: true,
        },
        where: {
          id,
        },
      });
      return user;
    }),
  unfollow: protectedProcedure
    .input(
      z.object({
        followingId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { followingId } = input;
      await ctx.prisma.following.deleteMany({
        where: {
          followerId: followingId,
          userId: ctx.session.user.id,
        },
      });
    }),
  follow: protectedProcedure
    .input(
      z.object({
        followingId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { followingId } = input;
      await ctx.prisma.following.create({
        data: {
          followerId: followingId,
          userId: ctx.session?.user.id,
        },
      });
    }),
  findById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const user = await ctx.prisma.user.findFirst({
        where: {
          id,
        },
        select: defaultUserSelect,
      });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No user with id '${id}'`,
        });
      }
      return user;
    }),
  findByName: publicProcedure
    .input(
      z.object({
        name: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { name } = input;
      const user = await ctx.prisma.user.findFirst({
        where: {
          name,
        },
        select: defaultUserSelect,
      });
      return user;
    }),
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
            replies: true,
          },
        },
      },
    });
    return user;
  }),
  changeAvatar: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        url: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { url, id } = input;
      await ctx.prisma.user.update({
        data: {
          avatarUrl: url,
        },
        where: {
          id,
        },
      });
    }),
  changeBanner: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        url: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { url, id } = input;
      await ctx.prisma.user.update({
        data: {
          bannerUrl: url,
        },
        where: {
          id,
        },
      });
    }),
  changeIsFirstLogin: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isFirstLogin: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, isFirstLogin } = input;
      await ctx.prisma.user.update({
        data: {
          isFirstLogin,
        },
        where: {
          id,
        },
      });
    }),
  isFirstLogin: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const data = await ctx.prisma.user.findFirst({
        select: {
          isFirstLogin: true,
        },
        where: {
          id,
        },
      });
      return data;
    }),
  changeUsername: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { name } = input;
      await ctx.prisma.user.update({
        data: {
          name,
        },
        where: {
          id: ctx.session.user.id,
        },
      });
    }),
});
