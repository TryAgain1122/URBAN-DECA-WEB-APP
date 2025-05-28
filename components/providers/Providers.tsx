'use client'

import {HeroUIProvider} from "@heroui/react";
import {ThemeProvider as NextThemesProvider} from "next-themes";

interface PropsProvider {
    children: React.ReactNode
} 

const Providers: React.FC<PropsProvider> = ({ children }) => {
  return (
    <HeroUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="darkmode">
            {children}
        </NextThemesProvider>
    </HeroUIProvider>
  )
}

export default Providers