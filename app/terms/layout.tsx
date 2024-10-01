import { Metadata } from 'next'
import * as React from 'react'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Please remember, you are underneath an NDA',
}

const MainLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className='flex flex-col min-h-screen mx-auto'>
      <div className='flex-grow'>
        <main className='flex flex-col max-w-7xl px-2 sm:px-4 lg:px-8 mx-auto my-0 py-4'>{children}</main>
      </div>
    </div>
  )
}

export default MainLayout
