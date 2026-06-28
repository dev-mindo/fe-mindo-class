"use client";
import { useEffect } from "react";

type Props = {
  redirectUrl: string;
  token: string | undefined;
};

export const Portal = ({ token, redirectUrl }: Props) => {
  useEffect(() => {
    const setCookiesdata = async () => {
      if (!token) {
        return;
      }

      const response = await fetch(
        `/api/set-token?token=${encodeURIComponent(token)}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        window.location.href = redirectUrl;
      }
    };

    setCookiesdata();
  }, [redirectUrl, token]);

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      Redirect...
    </div>
  );
};
