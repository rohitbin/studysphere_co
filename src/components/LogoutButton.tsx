"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <button 
      onClick={handleLogout} 
      className="admin-nav-item" 
      style={{ 
        width: '100%', 
        textAlign: 'left', 
        background: 'none', 
        border: 'none', 
        color: '#ff4d4f', 
        marginTop: 'auto',
        cursor: 'pointer'
      }}
    >
      🚪 Logout
    </button>
  );
}
