"use client";
import { Button } from "@/components/ui/button";
import { getAuthToken } from "@/lib/action/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  redirectUrl: string;
  token: string | undefined;
};

export const Portal = ({ token, redirectUrl }: Props) => {
  useEffect(() => {
    setCookiesdata(token);    
    window.location.href = redirectUrl
  }, []);

  // const getCookiesdata = async () => {
  //   console.log("test");
  //   const response = await getAuthToken()
    
  //   console.log(response)
  // };

  const setCookiesdata = async (token: string | undefined) => {    
    if (token) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/set-token?token=${token}`,
        {
          method: "POST",
        }
      );
    }    
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      Redirect...
      {/* <Button onClick={setCookiesdata}>
        set cookies
      </Button> */}
      {/* <Button onClick={getCookiesdata}>get cookies</Button> */}
    </div>
  );
};
