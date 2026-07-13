import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://griller.dk";
const TITLE = "griller.dk · Hvornår griller Martin og Jesper igen?";
const DESCRIPTION =
  "Uofficiel driftsstatus: Hvornår griller Martin og Jesper igen? Live-status, nedtælling og grillsandsynlighedsmåler — kridtet op i Gudhjem havn.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    title: "Hvornår griller Martin og Jesper igen?",
    description:
      "Uofficiel driftsstatus: live-status, nedtælling og grillsandsynlighedsmåler — kridtet op i Gudhjem havn.",
    images: [{ url: "/hero.jpg", width: 1152, height: 1536 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hvornår griller Martin og Jesper igen?",
    description:
      "Uofficiel driftsstatus: live-status, nedtælling og grillsandsynlighedsmåler — kridtet op i Gudhjem havn.",
    images: ["/hero.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
  );
}
