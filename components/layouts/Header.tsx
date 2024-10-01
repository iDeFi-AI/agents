'use client'

import React from 'react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import NavMenu from './NavMenu'

export const Header: React.FC<HeaderProps> = ({}) => {
  const [] = useState(false)

  return (
    <header id='App:Header' className={cn('bg-white')}>
      <NavMenu />
    </header>
  )
}

interface HeaderProps {}

export default Header
