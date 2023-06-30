import { Loader2, MoreHorizontal } from "lucide-react";
import { api } from "~/utils/api";
import { Horizontal } from "../ui/horizontal";
import {
  Popover,
  PopoverButton,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Vertical } from "../ui/vertical";
import { type User } from "@prisma/client";

const ReplyCard = ({
  text,
  id,
  authorId,
  userId,
  postId,
  author,
}: {
  text: string;
  id: string;
  authorId: string;
  userId: string;
  postId: string;
  author: User;
}) => {
  const utils = api.useContext();
  const isMe = authorId === userId;
  const { mutate: replyMut, isLoading } = api.reply.delete.useMutation({
    async onSuccess() {
      await utils.reply.getReplies.invalidate({
        postId,
      });
      await utils.post.byId.invalidate({
        id: postId,
      });
    },
  });
  const handleDelete = () => {
    replyMut({
      id,
    });
  };
  return (
    <Vertical className="border-b border-border p-4 text-xl font-normal leading-6 text-primary hover:bg-secondary dark:text-gray-200">
      <Horizontal className="justify-between">
        <span className="text-sm font-semibold text-primary">
          {author?.name}
        </span>
        {isMe && (
          <Popover>
            <PopoverTrigger>
              {" "}
              <MoreHorizontal size={20} />
            </PopoverTrigger>
            <PopoverContent className="w-32 p-1">
              <PopoverButton
                onClick={handleDelete}
                className="rounded-sm"
                color="red"
              >
                {isLoading && <Loader2 size={20} className="mr-2" />}
                Delete
              </PopoverButton>
            </PopoverContent>
          </Popover>
        )}
      </Horizontal>
      <p className="w-full break-words text-base text-accent-foreground">
        {text}
      </p>
    </Vertical>
  );
};
export default ReplyCard;
