'use client'

import {NextUIProvider} from "@nextui-org/react";
import {ThemeProvider as NextThemesProvider} from "next-themes";

interface PropsProvider {
    children: React.ReactNode
} 

const Providers: React.FC<PropsProvider> = ({ children }) => {
  return (
    <NextUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="darkmode">
            {children}
        </NextThemesProvider>
    </NextUIProvider>
  )
}

export default Providers