"use client";
import { useEffect } from "react";

type Props = {
  classSlug: string | undefined;
  redirectUrl: string;
  token: string | undefined;
};

export const Portal = ({ classSlug, token, redirectUrl }: Props) => {
  useEffect(() => {
    const setCookiesdata = async () => {
      if (!token) {
        return;
      }

      const setTokenResponse = await fetch(
        `/api/set-token?token=${encodeURIComponent(token)}`,
        {
          method: "POST",
        }
      );

      if (classSlug) {
        try {
          await fetch("/api/save-timezone", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              classSlug,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              token,
            }),
          });
        } catch (error) {
          console.error("Failed to save timezone", error);
        }
      }

      if (setTokenResponse.ok) {
        window.location.href = redirectUrl;
      }
    };

    setCookiesdata();
  }, [classSlug, redirectUrl, token]);

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      Redirect...
    </div>
  );
};
