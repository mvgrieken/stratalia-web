'use client';

import React from 'react';
import Link from 'next/link';

interface NavItemProps {
  label: string;
  href: string;
  icon: string;
  requiresAuth: boolean;
  requiresAdmin?: boolean;
  user: any;
  isMobile?: boolean;
}

export default function NavItem({ 
  label, 
  href, 
  icon, 
  requiresAuth, 
  requiresAdmin = false, 
  user, 
  isMobile = false 
}: NavItemProps) {
  const isAccessible = !requiresAuth || (user && (!requiresAdmin || user.role === 'admin'));
  
  const baseClasses = isMobile 
    ? "block px-3 py-2 rounded-md text-base font-medium transition-colors"
    : "px-2 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap";
  
  const accessibleClasses = isMobile
    ? "text-white hover:text-blue-200"
    : "text-white hover:text-blue-200";
    
  const lockedClasses = isMobile
    ? "text-white text-opacity-60 cursor-not-allowed"
    : "text-white text-opacity-60 cursor-not-allowed flex items-center";

  if (isAccessible) {
    return (
      <Link href={href} className={`${baseClasses} ${accessibleClasses}`}>
        {icon} {label}
      </Link>
    );
  }

  return (
    <span className={`${baseClasses} ${lockedClasses}`}>
      {icon} {label} 🔒
    </span>
  );
}
