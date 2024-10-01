'use client'

import React from 'react'
import { useState } from 'react'

import NavMenu from './NavMenu'

export const Header: React.FC<HeaderProps> = ({}) => {
  const [] = useState(false)

  return (
    <header id='App:Header' className={('bg-white')}>
      <NavMenu />
    </header>
  )
}

interface HeaderProps {}

export default Header
