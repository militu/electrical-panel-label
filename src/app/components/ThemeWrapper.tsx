"use client";

import useTheme from "@/app/hooks/useTheme";
import React from "react";

export default function ThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useTheme();
  return <>{children}</>;
}
