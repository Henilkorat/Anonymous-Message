import type { Metadata } from "next";
import "../app/globals.css";

export const metadata: Metadata = {
  title: "Anonymous Message App",
  description: "Send and receive anonymous messages securely.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
