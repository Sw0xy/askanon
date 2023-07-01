import { type GetServerSidePropsContext } from "next";
import Link from "next/link";
import clsx from "clsx";
import { getServerSession } from "next-auth";
import { getProviders, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { BiLogoDiscord, BiLogoGoogle } from "react-icons/bi";
import { Button } from "~/components/ui/button";
import { authOptions } from "~/server/auth";
type Provider = {
  id: string;
  name: string;
  signinUrl: string;
  type: string;
  callbackUrl: string;
};
const SignInPage = ({ providers }: { providers: Provider[] }) => {
  const {
    query: { callbackUrl },
  } = useRouter();

  return (
    <>
      <div className="flex h-screen w-full items-center justify-center">
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
            </div>
            <div className="w-full ">
              {Object.values(providers).map((provider) => (
                <Link href={provider.signinUrl} key={provider.name}>
                  <Button
                    variant="outline"
                    type="button"
                    className={clsx(
                      "mt-2 w-full bg-blue-600 text-white",
                      provider.name === "Google" && "bg-transparent"
                    )}
                    onClick={() =>
                      void signIn(provider.id, {
                        callbackUrl: callbackUrl as string,
                      })
                    }
                  >
                    {provider.name === "Google" ? (
                      <BiLogoGoogle size={24} />
                    ) : (
                      <BiLogoDiscord size={24} />
                    )}
                    Sign In with {provider.name}
                  </Button>
                </Link>
              ))}
            </div>
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <Link
                href="/"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInPage;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session) {
    return { redirect: { destination: "/home" } };
  }

  return {
    props: {
      providers: await getProviders(),
    },
  };
};
