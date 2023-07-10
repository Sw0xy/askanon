import { type Post, type Reply } from "@prisma/client";
import { Calendar } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { useState } from "react";
//import { s3 } from "~/s3/s3";
import { api } from "~/utils/api";
import { AspectRatio } from "../ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Horizontal } from "../ui/horizontal";
import { Vertical } from "../ui/vertical";
import { EditProfileDialog } from "./edit-profile-dialog";
import { UploadImageDialog } from "./upload-image-dialog";
import axios from "axios";

export interface TUser {
  id: string;
  name: string;
  createdAt: Date;
  bannerUrl: string;
  avatarUrl: string;
  replies: Reply[];
  posts: Post[];
  _count: { followers: number; following: number };
}

const UserHeader = ({ isMe, user }: { isMe: boolean; user: TUser }) => {
  const [avatar, setAvatarImage] = useState<File>();
  const [banner, setBannerImage] = useState<File>();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const utils = api.useContext();
  const { data: me } = api.user.me.useQuery();
  const { data: isFollowing } = api.user.getIsFollowing.useQuery({
    id: user.id,
  });
  const { mutateAsync: getUrl } = api.image.getUploadPresignedUrl.useMutation();
  const { mutate: changeBannerMut, isLoading: bannerIsLoading } =
    api.user.changeBanner.useMutation({
      async onSuccess() {
        await utils.user.me.invalidate();
      },
    });
  const { mutate: changeAvatarMut, isLoading: avatarIsLoading } =
    api.user.changeAvatar.useMutation({
      async onSuccess() {
        await utils.user.me.invalidate();
      },
    });

  const joinedAt = moment(user.createdAt).format("ll");

  const getImageUrl: (
    image: File | undefined
  ) => Promise<string | undefined> = async (image: typeof banner) => {
    if (!image) return;
    return await getUrl({
      key: image.name,
    }).then(({ signedUrl, fileUrl }) => {
      setImageUrl(fileUrl);
      return signedUrl;
    });
  };

  const uploadImage = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "banner"
  ) => {
    switch (type) {
      case "avatar":
        setAvatarImage(e?.target?.files?.[0]);
      case "banner":
        setBannerImage(e?.target?.files?.[0]);
    }
  };

  const handleChangeAvatar = async () => {
    if (!avatar) return;

    try {
      await getImageUrl(avatar).then(async (url) => {
        if (url !== undefined) {
          await axios
            .put(url, avatar, {
              headers: { "Content-Type": avatar.type },
            })
            .then(({ data, status }) => {
              if (!imageUrl) return;
              console.log("res", data);
              console.log(status);

              changeAvatarMut({
                id: me?.id || "",
                url: imageUrl,
              });

              setImageUrl(null);
              setAvatarImage(undefined);
            });
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleChangeBanner = async () => {
    if (!banner) return;
    try {
      await getImageUrl(banner).then(async (url) => {
        if (url !== undefined) {
          await axios
            .put(url, banner.slice(), {
              headers: { "Content-Type": banner.type },
            })
            .then((data) => {
              if (!imageUrl) return;
              if (!data) return;
              console.log("res", data);

              changeBannerMut({
                id: me?.id || "",
                url: imageUrl,
              });

              setImageUrl(null);
              setAvatarImage(undefined);
            });
        }
      });
    } catch (err) {
      console.log(err);
    }
  };
  const followMutation = api.user.follow.useMutation({
    async onSuccess() {
      await utils.user.getIsFollowing.invalidate();
      await utils.user.findByName.invalidate();
    },
  });
  const unFollowMutation = api.user.unfollow.useMutation({
    async onSuccess() {
      await utils.user.getIsFollowing.invalidate();
      await utils.user.findByName.invalidate();
    },
  });

  const handleUnfollow = () => {
    if (!user) return;
    unFollowMutation.mutate({
      followingId: user.id,
    });
  };
  const handleFollow = () => {
    if (!user) return;

    followMutation.mutate({
      followingId: user.id,
    });
  };
  return (
    <>
      {me?.bannerUrl ? (
        <AspectRatio ratio={16 / 5} className="group w-full bg-muted">
          {isMe && (
            <div className="absolute z-10 hidden h-full w-full justify-end bg-black/50 p-2 group-hover:flex group-hover:items-end">
              <UploadImageDialog
                type="banner"
                handleChange={handleChangeBanner}
                uploadImage={uploadImage}
                isLoading={bannerIsLoading}
              />
            </div>
          )}
          <Image
            src={isMe ? me?.bannerUrl : user?.bannerUrl}
            className="h-full w-full object-cover"
            width={600}
            height={200}
            priority
            alt="banner"
          />
        </AspectRatio>
      ) : (
        <AspectRatio ratio={16 / 5} className="group">
          {isMe && (
            <div className="absolute z-10 hidden h-full w-full justify-end bg-black/50 p-2 group-hover:flex group-hover:items-end">
              <UploadImageDialog
                type="banner"
                handleChange={handleChangeBanner}
                uploadImage={uploadImage}
                isLoading={bannerIsLoading}
              />
            </div>
          )}
        </AspectRatio>
      )}

      <Horizontal centerV className="relative">
        <div className="group relative w-full">
          {isMe && (
            <div className="absolute -bottom-16 left-4 z-20 hidden h-24 w-24 justify-end rounded-full bg-black/50 p-2 group-hover:flex group-hover:items-center group-hover:justify-center md:left-7 md:h-32 md:w-32">
              <UploadImageDialog
                type="avatar"
                handleChange={handleChangeAvatar}
                uploadImage={uploadImage}
                isLoading={avatarIsLoading}
              />
            </div>
          )}
          <Avatar className="absolute -bottom-16 left-4 z-10 h-24 w-24 border-[5px] border-background md:left-7 md:h-32 md:w-32">
            <AvatarImage
              src={isMe ? me?.avatarUrl : user.avatarUrl}
              className="object-cover"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </Horizontal>
      <Vertical className="gap-y-4 border-b border-border px-4 pb-5 md:px-8">
        <Horizontal className="mt-16 justify-between">
          <Vertical className="justify-center">
            <span className="text-base font-bold leading-6 md:text-lg">
              {user.name}
            </span>
          </Vertical>

          {isMe ? (
            <EditProfileDialog />
          ) : isFollowing ? (
            <Button onClick={handleFollow}>Follow</Button>
          ) : (
            <Button variant="destructive" onClick={handleUnfollow}>
              Unfollow
            </Button>
          )}
        </Horizontal>
        <Horizontal className="gap-x-5">
          <Horizontal className="gap-x-2">
            <Calendar size={18} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Joined {joinedAt}
            </span>
          </Horizontal>
        </Horizontal>
        <Horizontal centerV className="justify-between gap-x-3">
          <Horizontal centerV className="gap-x-2">
            <span className="text-sm">
              <strong>{user._count.following}</strong> Following
            </span>
            <span className="text-sm">
              <strong>{user._count.followers}</strong> Followers
            </span>
          </Horizontal>
        </Horizontal>
      </Vertical>
    </>
  );
};
export default UserHeader;
