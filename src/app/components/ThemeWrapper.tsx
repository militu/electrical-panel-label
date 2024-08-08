'use client'

import React from 'react'
import useTheme from '@/app/hooks/useTheme'

export default function ThemeWrapper({children}: { children: React.ReactNode }) {
    useTheme()
    return <>{children}</>
}