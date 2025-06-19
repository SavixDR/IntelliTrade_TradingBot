'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/AuthModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTimeStore } from '@/lib/timeStore';

export function Header() {
  const { user, setUser } = useStore();
  const {currentTime} = useTimeStore();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <header className="relative top-0 left-0 w-full z-50 bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Intellitrade
        </Link>
        {/* Show the current time using currentTime converted to ISOString at the middle properly */}
        <div className="flex-1 text-center">
          <span className="text-xl font-semibold">
            {currentTime.toISOString().substring(11, 16)}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <Button onClick={() => setShowAuthModal(true)}>Login</Button>
          )}
          <ThemeToggle />
        </div>
      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  );
}
