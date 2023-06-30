/* eslint-disable @typescript-eslint/no-misused-promises */

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, signOut, useSession } from "next-auth/react";
import { createContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { api } from "~/utils/api";

const FirstLoginProvider = createContext({
  isCompleted: false,
});

const formSchema = z.object({
  username: z.string().toLowerCase().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

const FirstLoginContext = ({ children }: { children: React.ReactNode }) => {
  const { data: sessionData, status } = useSession();

  const [isCompleted, setIsCompleted] = useState(false);
  const changeUsernameMut = api.user.changeUsername.useMutation();

  const changeIsFirstLoginMut = api.user.changeIsFirstLogin.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });
  const { data } = api.user.isFirstLogin.useQuery({
    id: sessionData?.user?.id ?? "",
  });

  useEffect(() => {
    if (data?.isFirstLogin) {
      setIsCompleted(true);
    }
    if (status === "unauthenticated") {
      setIsCompleted(true);
    }
  }, [data?.isFirstLogin, status]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>): void {
    const { username } = values;
    if (!sessionData) return;
    changeUsernameMut.mutate({
      name: username,
    });
    changeIsFirstLoginMut.mutate({
      id: sessionData?.user.id,
      isFirstLogin: false,
    });
    setIsCompleted(false);
  }

  return (
    <FirstLoginProvider.Provider value={{ isCompleted }}>
      {children}
      <div>
        <Dialog open={isCompleted}>
          <DialogContent className="rounded-3xl sm:max-w-[532px]">
            <DialogHeader>
              <DialogTitle>Sign in</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when youre done.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col">
              {sessionData ? (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="shadcn" {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button type="submit" className="mt-5 rounded-full">
                        Save
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              ) : (
                <button
                  className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                  onClick={
                    sessionData ? () => void signOut() : () => void signIn()
                  }
                >
                  {sessionData ? "Sign out" : "Sign in"}
                </button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </FirstLoginProvider.Provider>
  );
};
export { FirstLoginContext };
