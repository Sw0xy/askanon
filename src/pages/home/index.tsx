import { Loader2 } from "lucide-react";
import { type NextPage } from "next";
import Head from "next/head";
import { Fragment, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { QuestionCard } from "~/components/home/question-card";
import Layout from "~/components/layouts/layout";
import Header from "~/components/user-profile/header";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const { ref, inView } = useInView();
  const { data, fetchNextPage, isLoading, isFetchingNextPage } =
    api.post.getTimelinePosts.useInfiniteQuery(
      {
        limit: 5,
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

  if (!data) return <Loader2 />;

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <Layout>
        <main className="h-full w-full pb-8 md:pb-0 ">
          <Header />
          {data?.pages.map((page, index) => (
            <Fragment key={index}>
              {page.items.map(({ id, answer, text, toUserId, _count }) => (
                <QuestionCard
                  key={id}
                  id={id}
                  answer={answer}
                  text={text}
                  authorId={toUserId}
                  likeCount={_count.likes}
                  replyCount={_count.replies}
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
        </main>
      </Layout>
    </>
  );
};

export default Home;
