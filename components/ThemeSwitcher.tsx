"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FaRegMoon } from "react-icons/fa";
import { LuSun } from "react-icons/lu";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false); // For mounting check
  const { theme, setTheme } = useTheme();
  const [isSpinning, setIsSpinning] = useState(false); // State to handle spinning

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setIsSpinning(true); // Start spin animation
    setTimeout(() => setIsSpinning(false), 500); // Stop spin after 500ms

    // Toggle between light and dark themes
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div onClick={toggleTheme} className="flex flex-col gap-2 cursor-pointer">
      <div
        className={`transition-transform duration-500 ${isSpinning ? "rotate-180" : ""}`}
      >
        {theme === "light" ? <FaRegMoon size={20}/> : <LuSun size={20}/>}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
