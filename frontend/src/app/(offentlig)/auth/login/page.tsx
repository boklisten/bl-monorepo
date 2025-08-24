import { Metadata } from "next";

import SignIn from "@/components/user/SignIn";

export const metadata: Metadata = {
  title: "Logg inn",
  description:
    "Logg inn for bestille bøker, samt se status på nåvårende bøker.",
};

const LoginPage = () => {
  return <SignIn />;
};

export default LoginPage;
