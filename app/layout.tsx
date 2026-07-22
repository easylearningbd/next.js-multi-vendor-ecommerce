import type { Metadata } from "next";
import { Sora, Instrument_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Covet — Multi-vendor marketplace",
  description:
    "One storefront, one checkout, thousands of independent sellers and brands.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${instrumentSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: "var(--font-instrument), system-ui, sans-serif",
              fontSize: "13.5px",
              borderRadius: "12px",
              color: "#17151f",
              border: "1px solid #ececf1",
              boxShadow: "0 16px 34px -14px rgba(20,18,31,.18)",
            },
          }}
        />
      </body>
    </html>
  );
}
