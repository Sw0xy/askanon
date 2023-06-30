import { cx } from "class-variance-authority";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { GetStaticProps, GetStaticPropsContext, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { QuestionCard } from "~/components/home/question-card";
import Layout from "~/components/layouts/layout";
import ReplyCard from "~/components/post-page/reply-card";
import { Button } from "~/components/ui/button";
import { Horizontal } from "~/components/ui/horizontal";
import { Textarea } from "~/components/ui/textarea";
import { Vertical } from "~/components/ui/vertical";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";

const PostPage: NextPage<{ id: string }> = ({ id }) => {
  const utils = api.useContext();
  const [text, setText] = useState<string>("");
  const { ref, inView } = useInView();
  const { data: me } = api.user.me.useQuery();
  const { data: post } = api.post.byId.useQuery({
    id,
  });
  const { data, fetchNextPage, isLoading, isFetchingNextPage } =
    api.reply.getReplies.useInfiniteQuery(
      {
        limit: 5,
        postId: id,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );
  const replyMutation = api.reply.create.useMutation({
    async onSuccess() {
      await utils.post.byId.invalidate({
        id,
      });
      await utils.reply.getReplies.invalidate({
        postId: id,
      });
    },
  });

  const handleReply = () => {
    replyMutation.mutate({
      postId: id,
      text,
    });
    setText("");
  };

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [fetchNextPage, inView]);
  if (!post) return <Loader2 />;
  if (!me) return <Loader2 />;
  return (
    <>
      <Head>
        <title>askanon</title>
      </Head>
      <Layout>
        <Vertical>
          <div className="sticky top-0 z-20 w-full bg-transparent">
            <Horizontal
              centerV
              className="gap-x-2 bg-background/50 p-3 backdrop-blur-sm"
            >
              <Link href="/home">
                <div className="w-max rounded-full p-2 hover:bg-secondary">
                  <ArrowLeft />
                </div>
              </Link>
              <h1 className="text-lg font-semibold text-accent-foreground">
                Question
              </h1>
            </Horizontal>
          </div>
          <QuestionCard
            authorId={post?.toUserId}
            id={post.id}
            likeCount={post?._count.likes}
            replyCount={post?._count.replies}
            text={post?.text}
            answer={post?.answer}
          />
          <Vertical>
            <div className="w-full border-y border-border px-2 py-3">
              <Vertical>
                <Textarea
                  onChange={(e) => setText(e.target.value)}
                  value={text}
                  placeholder="Reply..."
                  className="mt-2 w-full rounded-none border-none focus-visible:ring-0"
                />
                <p
                  className={cx(
                    "my-1 self-end text-sm font-semibold text-accent-foreground",
                    {
                      "text-red-500": text.length > 180,
                    }
                  )}
                >
                  {text.length} / 180
                </p>
              </Vertical>
              <Horizontal className="mt-2 w-full items-center justify-end">
                <Button
                  onClick={handleReply}
                  type="submit"
                  disabled={text.length < 10 || (text.length > 180 && true)}
                  className="rounded-full px-5"
                >
                  Send
                </Button>
              </Horizontal>
            </div>
          </Vertical>
          <Vertical>
            {data?.pages.map((page, index) => (
              <Fragment key={index}>
                {page.items.map(({ text, id, authorId, postId, author }) => (
                  <ReplyCard
                    key={id}
                    text={text}
                    id={id}
                    authorId={authorId}
                    userId={me.id}
                    postId={postId}
                    author={author}
                  />
                ))}
              </Fragment>
            ))}
            <div
              ref={ref}
              onClick={() => void fetchNextPage()}
              className="text-center"
            ></div>
            {isFetchingNextPage && <Loader2 />}
            {isLoading && <Loader2 />}
          </Vertical>
        </Vertical>
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (
  context: GetStaticPropsContext
) => {
  const ssg = generateSSGHelper();

  const id = context.params?.postId;

  if (typeof id !== "string") throw new Error("no slug");

  await ssg.post.byId.prefetch({ id });

  await ssg.reply.getReplies.prefetchInfinite({
    postId: id,
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default PostPage;
