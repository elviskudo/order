import React from 'react';
import Sidebar from './Sidebar';
import { ChevronDown } from 'react-feather';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen font-poppins bg-gray-100">
      <div className='flex justify-between border-b shadow-md p-4'>
        <h1 className="text-2xl w-3/4 font-bold">MyBrand</h1>
        <div className='flex gap-2 items-center text-right'>
          <span className='rounded-full bg-blue-400 p-2 text-white'>CR</span>
          Cooper Rosser
          <ChevronDown className='text-gray-400' />
        </div>
      </div>
      <div className='flex'>
        <Sidebar />
        <main className="container mx-auto flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
