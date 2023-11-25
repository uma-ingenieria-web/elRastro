import React from "react";
import Link from "next/link";

interface NavbarItemProps {
    pathName: string;
    name: string;
}

const NavbarItem = ({ pathName, name }: NavbarItemProps) => {
    return (
        <li>
            <Link href={pathName} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">{name}</Link>
        </li>
    );
};

export default NavbarItem;