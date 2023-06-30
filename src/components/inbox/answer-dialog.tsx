import { useState } from "react";
import { api } from "~/utils/api";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Vertical } from "../ui/vertical";

const AnswerDialog = ({ id }: { id: string }) => {
  const utils = api.useContext();
  const replyMut = api.post.createAnswer.useMutation({
    async onSuccess() {
      await utils.post.getUserPosts.invalidate();
      await utils.post.getInboxPosts.invalidate();
      await utils.post.getTimelinePosts.prefetchInfinite(
        {
          limit: 5,
        },
        {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          getNextPageParam: (lastPage) => lastPage.cursor,
        }
      );
    },
  });
  const [text, setText] = useState<string>("");
  const handleSubmit = () => {
    replyMut.mutate({
      postId: id,
      answer: text,
    });

    setText("");
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          Reply
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-3xl sm:max-w-[532px]">
        <DialogHeader>
          <DialogTitle>Reply</DialogTitle>
        </DialogHeader>
        <Vertical className="gap-y-2">
          <Textarea
            id="reply"
            className="border-none text-base leading-5 focus:outline-none focus-visible:ring-0 "
            onChange={(e) => setText(e.target.value)}
          />
        </Vertical>
        <DialogFooter>
          <Button
            onClick={() => handleSubmit()}
            disabled={text.length < 10 || (text.length > 180 && true)}
            className="w-max self-end rounded-full"
          >
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnswerDialog;
