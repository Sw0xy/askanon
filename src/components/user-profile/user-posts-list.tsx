import { Loader2 } from "lucide-react";
import { Fragment, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { api } from "~/utils/api";
import { QuestionCard } from "../home/question-card";
import { QuestionInputCard } from "./question-input-card";
import { type TUser } from "./user-header";

const UserPostsList = ({ isMe, user }: { user: TUser; isMe: boolean }) => {
  const { ref: reloadRef, inView } = useInView();
  const {
    data: pages,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
  } = api.post.getUserPosts.useInfiniteQuery(
    {
      limit: 5,
      userId: user.id,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [fetchNextPage, inView]);
  return (
    <div className="pb-8 md:pb-0">
      {isMe || <QuestionInputCard toUserId={user?.id} />}
      {pages?.pages.map((page, index) => (
        <Fragment key={index}>
          {page.items.map(({ id, answer, text, toUserId, _count }) => (
            <QuestionCard
              key={id}
              id={id}
              answer={answer as string}
              text={text}
              authorId={toUserId}
              likeCount={_count.likes}
              replyCount={_count.replies}
            />
          ))}
        </Fragment>
      ))}
      <div
        ref={reloadRef}
        onClick={() => void fetchNextPage()}
        className="text-center"
      ></div>
      {isFetchingNextPage && <Loader2 />}
      {isLoading && <Loader2 />}
    </div>
  );
};
export default UserPostsList;
