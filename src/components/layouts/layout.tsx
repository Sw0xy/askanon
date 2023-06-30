import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import MobileNavbar from "../home/mobile-navbar";
import Sidebar from "../home/sidebar";
import { WhoToFollowCard } from "./components/who-to-follow-card";

export default function Layout({
  children,
}: {
  children?: JSX.Element;
}): JSX.Element {
  const router = useRouter();
  const { status } = useSession();
  if (status === "unauthenticated") {
    void router.push("/signin");
  }
  return (
    <>
      <main className="container mx-auto grid h-full min-h-screen w-full grid-cols-12 antialiased">
        <div className="sticky top-0 hidden h-full max-h-screen w-full p-4 md:col-span-4 md:block lg:col-span-3">
          <Sidebar />
        </div>
        <div className="col-span-12 max-w-4xl border-x border-border pb-12 md:col-span-8 md:pb-0 lg:col-span-6">
          {children}
        </div>
        <div className="sticky top-0 hidden h-full max-h-screen w-full p-4 lg:col-span-3 lg:block">
          <WhoToFollowCard />
        </div>
        <MobileNavbar />
      </main>
    </>
  );
}
