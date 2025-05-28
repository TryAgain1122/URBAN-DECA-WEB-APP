import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { GlobalProvider } from "./GlobalProvider";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Header2 from "@/components/layout/Header2";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Urban Deca Tower",
  description: "Explore more hotel rooms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <GlobalProvider>
          <Providers>
            {/* <Header /> */}
            <Header2 />
            <div className="block md:hidden absolute top-44 right-6">
              <ThemeSwitcher />
            </div>
            {children}
            <Footer />
          </Providers>
        </GlobalProvider>
      </body>
    </html>
  );
}
