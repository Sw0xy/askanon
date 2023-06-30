"use client";
import { cx } from "class-variance-authority";
import { useState } from "react";
import { api } from "~/utils/api";
import { Button } from "../ui/button";
import { Horizontal } from "../ui/horizontal";
import { Textarea } from "../ui/textarea";
import { Vertical } from "../ui/vertical";

const QuestionInputCard = ({ toUserId }: { toUserId: string }) => {
  const [text, setText] = useState<string>("");
  const questionMut = api.post.create.useMutation();

  const handleSend = () => {
    questionMut.mutate({
      text,
      toUserId,
    });
    setText("");
  };

  return (
    <div className="w-full border-b border-border px-2 py-3">
      <Vertical>
        <Textarea
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask question..."
          value={text}
          className="mt-2 w-full rounded-none border-none focus-visible:ring-0"
        />
        <p
          className={cx("my-1 self-end text-sm font-semibold text-primary", {
            "text-red-500": text.length > 180,
          })}
        >
          {text.length} / 180
        </p>
      </Vertical>

      <Horizontal className="mt-2 w-full items-center justify-end">
        <Button
          disabled={text.length < 10 || (text.length > 180 && true)}
          onClick={handleSend}
          type="submit"
          className="rounded-full px-5"
        >
          Send
        </Button>
      </Horizontal>
    </div>
  );
};
export { QuestionInputCard };
