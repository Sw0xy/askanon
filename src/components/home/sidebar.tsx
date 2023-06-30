import { cx } from "class-variance-authority";
import { HomeIcon, Inbox, Loader2, SettingsIcon, UserIcon } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { cn } from "~/lib/utils";
import { api } from "~/utils/api";
import { Button } from "../ui/button";
import { SearchUserInput } from "./search-user-input";

export const NavLink = ({
  href,
  icon,
  title,
  isMobile,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  isMobile?: boolean;
}) => {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const username = sessionData?.user.name ?? "";
  const isActive = router.asPath === `${href.toLowerCase()}`;

  return (
    <Link key={title} href={href === "" ? `${username}` : href}>
      <div
        className={cn(
          "flex w-full items-center rounded-full bg-background p-3 text-xl hover:bg-accent",
          { "bg-accent": isActive },
          { "bg-transparent p-2": isMobile }
        )}
      >
        {icon}
        {isMobile || <span className="mx-4">{title}</span>}
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const { data: sessionData } = useSession();
  const { data: user } = api.user.me.useQuery();

  const { data: posts } = api.post.getInboxPosts.useQuery({
    limit: 30,
  });

  const features = [
    {
      title: "Home",
      href: "/home",
      icon: <HomeIcon size={28} />,
    },
    {
      title: "Inbox",
      href: "/inbox",
      icon: (
        <div className="relative flex items-center">
          <Inbox size={28} />
          {posts?.count === 0 ? (
            <></>
          ) : (
            <div className="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-primary text-xs font-bold text-primary-foreground dark:border-gray-900">
              {posts?.count}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <SettingsIcon size={28} />,
    },
  ];
  if (!posts) return <Loader2 />;
  return (
    <div className="flex h-full w-full flex-col justify-between">
      <div className="flex w-full flex-col items-start justify-start gap-y-2">
        {features.map(({ href, icon, title }) => (
          <NavLink key={title} href={href} icon={icon} title={title} />
        ))}
        {user && (
          <NavLink
            key={0}
            // TODO: fix username
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            href={`/${user?.name}`}
            icon={<UserIcon size={28} />}
            title={"Profile"}
          />
        )}
        <SearchUserInput isMobile={false} />
      </div>

      <Button
        className={cx(
          "rounded-full",
          sessionData && "text-red-500 hover:bg-red-300/20 hover:text-red-500"
        )}
        variant="ghost"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </Button>
    </div>
  );
};

export default Sidebar;
