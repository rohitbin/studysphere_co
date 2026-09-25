"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For demonstration purposes, we will accept admin@gmail.com / alpzazzaz
    // Or any login for now since there's no DB connected yet.
    if (email === "admin@gmail.com" && password === "alpzazzaz") {
      // In a real application, we would call an API route here that issues a secure HttpOnly cookie or JWT.
      router.push("/admin/mock-tests");
    } else {
      setError("Invalid email or password. Please use admin@gmail.com / alpzazzaz");
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--secondary-blue)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '1rem', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', letterSpacing: '-0.5px' }}>Admin Login</h1>
          <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>Secure access for staff and administrators.</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-red)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="admin@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
            Login to Dashboard
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/" className="text-muted" style={{ fontSize: '0.875rem', textDecoration: 'underline' }}>
            &larr; Back to Main Site
          </Link>
        </div>
      </div>
    </div>
  );
}
