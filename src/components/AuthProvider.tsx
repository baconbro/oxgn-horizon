"use client";
 import { SessionProvider } from "next-auth/react";
    import React from "react";

    interface AuthProviderProps {
      children: React.ReactNode;
      // session?: any; // Optional: for passing initial session state if needed, but usually handled by SessionProvider
    }

    export default function AuthProvider({ children }: AuthProviderProps) {
      // The `SessionProvider` will automatically fetch the session.
      // No need to pass `session` prop unless specific advanced SSR/SSG scenarios with session.
      return <SessionProvider>{children}</SessionProvider>;
    }