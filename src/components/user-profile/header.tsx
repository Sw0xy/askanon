import { useRouter } from "next/router";

const Header = () => {
  const router = useRouter();
  const path = router.asPath;

  return (
    <div className="sticky top-0 z-40 w-full bg-transparent">
      <div className="border-b border-border bg-background/50 p-3 backdrop-blur-sm">
        <h1 className="text-lg font-semibold">
          {path.slice(1).charAt(0).toUpperCase() + path.slice(2)}
        </h1>
      </div>
    </div>
  );
};
export default Header;
