import { useTheme } from "next-themes";
import Head from "next/head";
import Header from "~/components/user-profile/header";
import Layout from "~/components/layouts/layout";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";

const SettingsPage = () => {
  const { systemTheme, theme, setTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <Layout>
        <main className="w-full">
          <Header />
          <div className="flex items-center space-x-2 p-8">
            <Switch
              id="dark-mode"
              defaultChecked={currentTheme == "dark" ? false : true}
              onCheckedChange={() =>
                currentTheme == "dark" ? setTheme("light") : setTheme("dark")
              }
            />
            <Label htmlFor="airplane-mode">Light mode</Label>
          </div>
        </main>
      </Layout>
    </>
  );
};
export default SettingsPage;
