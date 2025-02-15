import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="bg-[#F7F9FD] min-h-screen">{children}</div>;
}