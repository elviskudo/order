import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Mail } from 'react-feather';

const Sidebar = () => {
  return (
    <div className="h-screen bg-[#052A49] w-1/5 p-4">
      <aside className="p-6 h-5/6 text-white flex flex-col justify-between">
        <nav>
          <ul>
            <li className="mb-4">
              <Link href="/" className="flex items-center text-gray-300 hover:text-gray-400">
                <ShoppingCart className="mr-3" />
                Orders
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <div className="p-4">
        <div className="flex items-center text-gray-300 hover:text-white">
          <Mail className="mr-3" />
          <div>
            <p>Support</p>
            <a href="mailto:elviskudo@hotmail.com" className="underline">elviskudo@hotmail.com</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
