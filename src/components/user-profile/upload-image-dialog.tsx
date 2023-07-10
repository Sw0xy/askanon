import { ImageIcon, Loader2 } from "lucide-react";
import { useState } from "react";
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
const UploadImageDialog = ({
  type,
  handleChange,
  uploadImage,
  isLoading,
}: {
  type: "banner" | "avatar";
  handleChange: () => Promise<void>;
  uploadImage: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "banner" | "avatar"
  ) => void;
  isLoading: boolean;
}) => {
  const [isDisabled, setIsDisabled] = useState(true);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="rounded-full px-4">
          <ImageIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl sm:max-w-[532px]">
        <DialogHeader>
          <DialogTitle>Change {type}</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when youre done.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full p-4">
          <Input
            type="file"
            accept="image/png, image/jpeg"
            onChange={(e) => {
              uploadImage(e, type);
              setIsDisabled(false);
            }}
          />
        </div>
        <DialogFooter>
          <Button
            disabled={isDisabled}
            variant="default"
            type="submit"
            className="rounded-full"
            onClick={() => {
              void handleChange();
            }}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export { UploadImageDialog };
