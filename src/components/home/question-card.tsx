/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
  BadgeCheck,
  HeartIcon,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { api } from "~/utils/api";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Horizontal } from "../ui/horizontal";
import {
  Popover,
  PopoverButton,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Vertical } from "../ui/vertical";
import { Skeleton } from "../ui/skeleton";

export const QuestionCardSkeleton = () => {
  return (
    <Vertical className="w-full gap-y-2 border-t border-border p-2 md:p-4">
      <Horizontal centerV className="w-full gap-x-2">
        <Skeleton className="h-[50px] w-[50px] rounded-full" />
        <Vertical className="gap-y-2">
          <Skeleton className="h-[15px] w-[85px] rounded-full" />
          <Skeleton className="h-[15px] w-[50px] rounded-full" />
        </Vertical>
      </Horizontal>
      <Vertical className="mb-2 mt-4 gap-y-2 rounded-lg border border-border px-1.5 py-3">
        <Skeleton className="h-[15px] w-[85px] rounded-full" />
        <Skeleton className="h-[20px] w-full rounded-full" />
        <Skeleton className="h-[20px] w-1/2 rounded-full" />
      </Vertical>

      <Skeleton className="h-[15px] w-full rounded-full" />
      <Horizontal centerV className="mt-2 gap-x-2">
        <Skeleton className="h-[20px] w-[40px] rounded-full" />
        <Skeleton className="h-[20px] w-[40px] rounded-full" />
        <Skeleton className="h-[20px] w-[40px] rounded-full" />
      </Horizontal>
    </Vertical>
  );
};

const QuestionCard = ({
  id,
  text,
  answer,
  authorId,
  likeCount,
  replyCount,
}: {
  id: string;
  text: string;
  answer?: string | null;
  authorId: string;
  likeCount: number;
  replyCount: number;
}) => {
  const { data: me } = api.user.me.useQuery();
  const { data: user } = api.user.findById.useQuery({
    id: authorId,
  });
  const utils = api.useContext();
  const { data: isLiked } = api.post.isLiked.useQuery({
    id,
  });

  const deleteMut = api.post.delete.useMutation({
    async onSuccess() {
      await utils.post.getTimelinePosts.invalidate();
      await utils.post.getUserPosts.invalidate();
      await utils.post.byId.invalidate({
        id,
      });
    },
  });

  const likeMutation = api.post.like.useMutation({
    async onSuccess() {
      await utils.post.isLiked.invalidate({
        id,
      });
      await utils.post.getTimelinePosts.invalidate();
      await utils.post.getUserPosts.invalidate();
      await utils.post.byId.invalidate({
        id,
      });
    },
  });

  const unLikeMutation = api.post.unLike.useMutation({
    async onSuccess() {
      await utils.post.isLiked.invalidate({
        id,
      });
      await utils.post.getTimelinePosts.invalidate();
      await utils.post.getUserPosts.invalidate();
      await utils.post.byId.invalidate({
        id,
      });
    },
  });

  const handleLike = () => {
    likeMutation.mutate({
      id,
    });
  };

  const handleUnLike = () => {
    unLikeMutation.mutate({
      id,
    });
  };

  const handleDelete = () => {
    deleteMut.mutate({
      id,
    });
  };

  if (!user) return <QuestionCardSkeleton />;

  return (
    <Vertical>
      <div className="w-full border-t border-border p-2 md:p-4">
        <Horizontal className="justify-between">
          <Horizontal centerV className="gap-x-2">
            <Link href={`/${user.name}`}>
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatarUrl} className="object-cover" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </Link>
            <Vertical className="gap-y-1">
              <Link href={`/${user.name}`}>
                <Horizontal centerV className="gap-x-1">
                  <span className="font-medium">{user.name}</span>

                  <BadgeCheck size={18} className="text-primary" />
                </Horizontal>
                <Badge
                  variant="outline"
                  className="w-max bg-primary leading-3 text-white dark:text-black"
                >
                  {user?._count.posts} Points
                </Badge>
              </Link>
            </Vertical>
          </Horizontal>
          {me?.id === authorId && (
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="ghost">
                  <MoreHorizontal size={20} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-32 p-1">
                <PopoverButton
                  color="red"
                  className="font-medium"
                  onClick={handleDelete}
                >
                  Delete
                </PopoverButton>
              </PopoverContent>
            </Popover>
          )}
        </Horizontal>

        <Link href={`/p/${id}`}>
          <Vertical className="mb-2 mt-4 rounded-lg border border-border px-1.5 py-3 text-xl font-normal leading-6 hover:bg-accent ">
            <span className="text-sm font-semibold text-accent-foreground">
              Anonymous
            </span>
            <p className="break-words text-accent-foreground">{text}</p>
          </Vertical>
        </Link>
        <p className="my-2 ml-1.5 break-words text-[15px] leading-5 text-accent-foreground">
          {answer}
        </p>
        <Horizontal centerV className="gap-x-2">
          {isLiked ? (
            <Button
              size="sm"
              variant="ghost"
              className="group flex gap-x-2 rounded-full"
              onClick={handleUnLike}
            >
              <HeartIcon
                size={20}
                fill="rgb(239 68 68)"
                className="text-red-500 group-hover:text-red-500"
              />
              <span className="text-gray-500 group-hover:text-red-500">
                {likeCount}
              </span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="group flex gap-x-2 rounded-full"
              onClick={handleLike}
            >
              <HeartIcon
                size={20}
                className="text-gray-500 group-hover:text-red-500"
              />
              <span className="text-gray-500 group-hover:text-red-500">
                {likeCount}
              </span>
            </Button>
          )}

          <Link href={`/p/${id}`}>
            <Button
              size="sm"
              variant="ghost"
              className="group flex gap-x-2 rounded-full"
            >
              <MessageCircle
                size={20}
                className="text-gray-500 group-hover:text-blue-500"
              />
              <span className="text-gray-500 group-hover:text-blue-500">
                {replyCount}
              </span>
            </Button>
          </Link>
        </Horizontal>
      </div>
    </Vertical>
  );
};
export { QuestionCard };
