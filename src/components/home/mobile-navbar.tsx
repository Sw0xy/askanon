import { HomeIcon, Inbox, Loader2, SettingsIcon, UserIcon } from "lucide-react";
import { Suspense } from "react";
import { api } from "~/utils/api";
import { Horizontal } from "../ui/horizontal";
import { SearchUserInput } from "./search-user-input";
import { NavLink } from "./sidebar";

const MobileNavbar = () => {
  const { data: user } = api.user.me.useQuery();
  const { data: posts, isLoading } = api.post.getInboxPosts.useQuery({
    limit: 30,
  });

  const navlinks = [
    {
      title: "Home",
      href: "/home",
      icon: <HomeIcon size={24} />,
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
  ];

  if (isLoading) return <Loader2 />;

  return (
    <div className="fixed  bottom-0 z-40 w-full border-t border-border bg-background/50 p-3 backdrop-blur-md md:hidden">
      <Suspense fallback={<div>loading</div>}>
        <Horizontal centerV className="justify-between sm:px-6">
          {navlinks.map(({ href, icon, title }) => (
            <NavLink
              key={title}
              href={href}
              icon={icon}
              title={title}
              isMobile
            />
          ))}
          <SearchUserInput isMobile={true} />
          <NavLink
            href={`/settings`}
            icon={<SettingsIcon size={24} />}
            title={"Settings"}
            isMobile
          />
          {user?.name && (
            <NavLink
              href={`/${user?.name}`}
              icon={<UserIcon size={24} />}
              title={"Profile"}
              isMobile
            />
          )}
        </Horizontal>
      </Suspense>
    </div>
  );
};
export default MobileNavbar;
