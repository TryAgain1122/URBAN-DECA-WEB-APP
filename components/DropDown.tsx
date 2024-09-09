'use client'

import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Button
  } from "@nextui-org/react";
import ThemeSwitcher from "./ThemeSwitcher";
  
  const DropDown = () => {
    return (
      <Dropdown backdrop="blur">
      <DropdownTrigger>
        <Button 
          variant="bordered" 
        >
          Themes
        </Button>
      </DropdownTrigger>
      <DropdownMenu variant="faded" aria-label="Static Actions">
        <DropdownItem key="new"><ThemeSwitcher /></DropdownItem>
      </DropdownMenu>
    </Dropdown>
      );
    }
    
  export default DropDown
