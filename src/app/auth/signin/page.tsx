"use client"; // This page needs to be a client component for form handling

import { signIn, getCsrfToken, useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router
import { useEffect, useState } from "react";

export default function SignInPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Fetch CSRF token
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();

    if (status === "authenticated") {
      router.push("/"); // Redirect if already authenticated
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    const result = await signIn("credentials", {
      redirect: false, // Handle redirect manually or stay on page
      email: email,
      password: password,
      // csrfToken: csrfToken, // NextAuth.js v4 automatically includes CSRF token from a hidden input
    });

    if (result?.error) {
      setError(result.error);
      console.error("Sign-in error:", result.error);
    } else if (result?.ok) {
      // Successful sign-in
      router.push("/"); // Redirect to homepage or dashboard
    }
  };

  if (status === "loading" || status === "authenticated") {
    return <p>Loading...</p>; // Or a proper loading state/redirect
  }

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc" }}>
      <h1>Sign In to Horizon</h1>
      <form onSubmit={handleSubmit}>
        {/* NextAuth.js v5+ doesn't require manual CSRF token input for credentials if using its actions/hooks */}
        {/* For older versions or specific setups, you might need it: */}
        {/* <input name="csrfToken" type="hidden" defaultValue={csrfToken} /> */}
        <div>
           <label htmlFor="email">Email:</label>
<input
type="email"
id="email"
name="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
required
style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
             />
</div>
<div>
<label htmlFor="password">Password:</label>
<input
type="password"
id="password"
name="password"
value={password}
onChange={(e) => setPassword(e.target.value)}
required
style={{ width: "100%", padding: "8px", marginBottom: "20px" }}
/>
</div>
{error && <p style={{ color: "red" }}>{error}</p>}
<button type="submit" style={{ padding: "10px 20px" }}>Sign In</button>
</form>
</div>
);
}