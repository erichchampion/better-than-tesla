'use client';  // This marks it as a Client Component

import React from 'react';

export default function BackToTopButton() {
  const scrollToTop = () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  return (
    <button 
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full z-50"
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
}