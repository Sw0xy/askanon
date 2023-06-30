import { useRouter } from "next/router";
import { useEffect } from "react";

const App = () => {
  const router = useRouter();
  useEffect(() => {
    void router.push("/home");
  }, []);
  return <div>index</div>;
};
export default App;
