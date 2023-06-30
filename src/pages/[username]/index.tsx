import { Loader2 } from "lucide-react";
import type { GetStaticProps, GetStaticPropsContext, NextPage } from "next";
import Head from "next/head";
import Layout from "~/components/layouts/layout";
import Header from "~/components/user-profile/header";
import UserHeader, { type TUser } from "~/components/user-profile/user-header";
import UserPostsList from "~/components/user-profile/user-posts-list";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data: user } = api.user.findByName.useQuery({
    name: username,
  });
  const { data: me } = api.user.me.useQuery();

  const isMe = me?.id === user?.id;

  if (!me)
    return (
      <div className="mx-auto">
        <Loader2 />
      </div>
    );
  return (
    <>
      <Head>
        <title>{`${user?.name || "askanon"}`}</title>
      </Head>
      <Layout>
        <div className="h-full w-full">
          {user ? (
            <>
              <Header />
              <UserHeader isMe={isMe} me={me} user={user as TUser} />
              <UserPostsList isMe={isMe} user={user as TUser} />
            </>
          ) : (
            <span>User not found</span>
          )}
        </div>
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (
  context: GetStaticPropsContext
) => {
  const ssg = generateSSGHelper();

  const username = context.params?.username;

  if (typeof username !== "string") throw new Error("no username");

  await ssg.user.findByName.prefetch({ name: username });

  await ssg.user.me.prefetch();

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};
export default ProfilePage;
