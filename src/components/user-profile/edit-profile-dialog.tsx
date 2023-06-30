import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { api } from "~/utils/api";
import { Alert, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const EditProfileDialog = () => {
  const router = useRouter();
  const [isSuccessful, setIsSuccessful] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [username, setUsername] = useState("");
  const { data: me } = api.user.me.useQuery();
  const { mutate: changeUsernameMut, isLoading } =
    api.user.changeUsername.useMutation({
      onSuccess: () => {
        setIsSuccessful(true);
      },
      onError: () => {
        setIsError(true);
      },
    });
  const handleSave = async () => {
    changeUsernameMut({
      name: username,
    });
    await router.push(`/${username}`);
  };
  if (!me) return <Loader2 />;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full px-4">
          Edit profile
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-3xl sm:max-w-[532px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when youre done.
          </DialogDescription>
        </DialogHeader>
        {isSuccessful && (
          <Alert variant="success">
            <Check className="h-4 w-4" />
            <AlertTitle>Changes saved!</AlertTitle>
          </Alert>
        )}
        {isError && (
          <Alert variant="destructive">
            <Check className="h-4 w-4" />
            <AlertTitle>Error!</AlertTitle>
          </Alert>
        )}
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              defaultValue={me?.name || ""}
              className="col-span-4"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => void handleSave()} className="rounded-full">
            {isLoading && <Loader2 />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { EditProfileDialog };
