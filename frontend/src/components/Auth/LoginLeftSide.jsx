import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginLeftSide() {
  return (
    <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-primary via-primary-dark to-primary-light p-12 relative overflow-hidden h-full">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="auth-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <polygon points="60,0 120,60 60,120 0,60" fill="none" stroke="#ffffff" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-pattern)" />
        </svg>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-10 w-32 h-32 border border-white/10 rounded-full" />
      <div className="absolute bottom-20 left-10 w-24 h-24 border border-gold/10 rounded-full" />

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-md">
        {/* Logo */}
        <div className="mb-12 animate-float">
          <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-3xl backdrop-blur-sm flex items-center justify-center">
            <svg className="w-14 h-14 text-gold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </div>

          <h1 className="font-heading text-4xl font-bold mb-3">Jamia Tul Uloom</h1>
          <p className="text-white/80 text-lg">Muhammadiya</p>
        </div>

        {/* Welcome Message */}
        <div className="mb-12 space-y-3">
          <h2 className="text-3xl font-heading font-bold leading-tight">
            Welcome to Your Islamic Learning Journey
          </h2>
          <p className="text-white/70 text-base leading-relaxed">
            Join thousands of students worldwide learning Quran and Islamic studies from certified scholars
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="space-y-4 pt-8 border-t border-white/10">
          <div className="flex items-center gap-3 justify-center text-left">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm">Bank-Level Security</p>
              <p className="text-white/60 text-xs">SSL Encryption for all data</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center text-left">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a4 4 0 00-4-4h-2.5a4 4 0 00-4 4v1h10.5z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm">Trusted by 50,000+</p>
              <p className="text-white/60 text-xs">Students worldwide</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center text-left">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm">Certified Academy</p>
              <p className="text-white/60 text-xs">Accredited Islamic Education</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
