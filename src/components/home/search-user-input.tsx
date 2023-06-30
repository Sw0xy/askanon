import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { api } from "~/utils/api";
import { Alert, AlertTitle } from "../ui/alert";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Textarea } from "../ui/textarea";

export function SearchUserInput({ isMobile = false }: { isMobile: boolean }) {
  const [open, setOpen] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [value, setValue] = useState("");
  const [text, setText] = useState<string>("");
  const { data: me } = api.user.me.useQuery();
  const { data: user } = api.user.findByName.useQuery({
    name: value,
  });
  const sendQuestionMut = api.post.create.useMutation({
    onSuccess: () => {
      setIsSuccess(true);
    },

    onError: (err) => {
      setError(err.message);
    },
  });
  const { data: users } = api.user.search.useQuery(
    {
      name: value,
    },
    {
      enabled: !!value,
    }
  );
  const handleSend = () => {
    if (!user) return;
    sendQuestionMut.mutate({
      text,
      toUserId: user.id,
    });
    setText("");
  };
  return (
    <>
      <Dialog
        onOpenChange={() => {
          setIsSuccess(false);
          setError("");
        }}
      >
        <DialogTrigger asChild>
          {isMobile ? (
            <Button className="rounded-full p-2">
              <Plus />
            </Button>
          ) : (
            <Button
              variant="default"
              className="mt-5 w-10/12 whitespace-nowrap rounded-full p-6 text-base font-medium"
            >
              Ask Question
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="rounded-3xl sm:max-w-[532px]">
          <div className="mt-4 w-full">
            {isSuccess && (
              <Alert variant="success">
                <Check className="h-5 w-5" />
                <AlertTitle>Question sent</AlertTitle>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <Check className="h-4 w-4" />
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild className="mt-2">
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[200px] justify-between"
                >
                  {value
                    ? users?.find((user) => user.name === value)?.name
                    : "Select User"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search user..."
                    onValueChange={(value) => setValue(value)}
                  />
                  <CommandEmpty>No user found.</CommandEmpty>
                  <CommandGroup>
                    {users?.map((user) =>
                      user.name === me?.name ? null : (
                        <CommandItem
                          key={user.id}
                          onSelect={(currentValue) => {
                            setValue(
                              currentValue === value ? "" : currentValue
                            );

                            setOpen(false);
                          }}
                        >
                          {user.name}
                        </CommandItem>
                      )
                    )}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <Textarea
              onChange={(e) => setText(e.target.value)}
              value={text}
              placeholder="Ask question..."
              className="mt-2 border-none text-base leading-5 focus:outline-none focus-visible:ring-0"
            />

            <div className="mt-3 flex flex-row items-center justify-between">
              <Button
                disabled={value && text.length > 10 ? false : true}
                type="submit"
                className="rounded-full px-5"
                onClick={handleSend}
              >
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
