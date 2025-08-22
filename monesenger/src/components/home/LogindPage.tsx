"use client"

import RegisterPage from '@/app/register/page'
import { SignInButton, useAuth } from '@clerk/nextjs';
import React from 'react'

export function LogindPage(){
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <div>
        {isLoaded && isSignedIn && (
            <>
                <RegisterPage/>
            </>
        )}

        {isLoaded && !isSignedIn && (
            <div className="text-center text-gray-400 glass-card p-6">
            <p>新しい思い出を登録するには、ログインが必要です。</p>
            <div className="register-button-signInRap">
                <SignInButton mode="modal">
                    <button className="register-button-signIn">
                        ログイン / 新規登録
                    </button>
                </SignInButton>
            </div>
            </div>
        )}
    </div>
  )
}
