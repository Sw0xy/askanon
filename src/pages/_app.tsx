import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { type AppType } from "next/app";
import { Toaster } from "~/components/ui/toaster";
import { FirstLoginContext } from "~/contexts/first-login";
import "~/styles/globals.css";
import { api } from "~/utils/api";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class">
        <FirstLoginContext>
          <Component {...pageProps} />
          <Toaster />
        </FirstLoginContext>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
