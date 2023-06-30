import Head from "next/head";
import Header from "~/components/user-profile/header";
import AnswerDialog from "~/components/inbox/answer-dialog";
import Layout from "~/components/layouts/layout";

import { Horizontal } from "~/components/ui/horizontal";
import { api } from "~/utils/api";
import { Inbox, Loader2 } from "lucide-react";
import { Vertical } from "~/components/ui/vertical";

const NotificationsPage = () => {
  const { data: posts } = api.post.getInboxPosts.useQuery({
    limit: 30,
  });

  if (!posts) return <Loader2 />;

  return (
    <>
      <Head>
        <title>Inbox</title>
      </Head>
      <Layout>
        <main className="h-full w-full">
          <Header />
          {posts.items.length > 0 ? (
            posts.items.map((post) => (
              <Horizontal
                key={post.id}
                centerV
                className="justify-between gap-5 border-b border-border p-4"
              >
                <p className="break-words text-[15px] leading-5">{post.text}</p>
                <Horizontal centerV className="gap-x-4">
                  <AnswerDialog id={post.id} />
                </Horizontal>
              </Horizontal>
            ))
          ) : (
            <Vertical centerV className="mx-auto w-full pt-6">
              <Inbox size={58} className="text-primary" />
              <span className="font-semibold text-primary">
                No questions found
              </span>
            </Vertical>
          )}
        </main>
      </Layout>
    </>
  );
};
export default NotificationsPage;
