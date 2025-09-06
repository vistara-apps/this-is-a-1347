import React from 'react';

export function AppShell({ children }) {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {children}
      </div>
    </div>
  );
}