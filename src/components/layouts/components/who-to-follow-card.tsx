import { api } from "~/utils/api";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Horizontal } from "../../ui/horizontal";
import { Vertical } from "../../ui/vertical";
import { Info, Loader2 } from "lucide-react";
import Link from "next/link";

const UserLine = ({
  user,
}: {
  user: { id: string; avatarUrl: string; name: string | null };
}) => {
  const utils = api.useContext();
  const followMut = api.user.follow.useMutation({
    onSuccess: async () => {
      await utils.user.getWhoToFollow.invalidate();
    },
  });
  const handleFollow = () => {
    followMut.mutate({
      followingId: user.id,
    });
  };
  return (
    <Horizontal
      centerV
      className="w-full justify-between px-4 py-2 transition-all duration-200 ease-in-out hover:bg-secondary/50"
    >
      <Link href={`/${user.name || "home"}`}>
        <Horizontal centerV className="gap-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} className="object-cover" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span className="text-base font-semibold leading-none tracking-tight">
            {user.name || ""}
          </span>
        </Horizontal>
      </Link>
      <Button onClick={handleFollow} size="sm">
        Follow
      </Button>
    </Horizontal>
  );
};

export const WhoToFollowCard = () => {
  const { data } = api.user.getWhoToFollow.useQuery();

  if (!data) return <Loader2 />;

  return (
    <Vertical className="items-start rounded-2xl border border-border py-4">
      <span className="mb-4 ml-4 text-lg font-bold leading-none tracking-tight">
        Who to follow
      </span>
      <Vertical className="h-full w-full gap-y-2">
        {data.length > 0 ? (
          data.map((user, index) => <UserLine key={index} user={user} />)
        ) : (
          <Vertical centerV centerH className="h-full w-full">
            <Info size={26} />
            <span className="font-semibold text-accent-foreground">
              No users found
            </span>
          </Vertical>
        )}
      </Vertical>
    </Vertical>
  );
};
