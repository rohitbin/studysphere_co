import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link href="/" className="logo" style={{ color: 'white' }}>
          StudySphere_co<span style={{ fontSize: '1rem', display: 'block', fontWeight: 400, opacity: 0.8, marginTop: '0.25rem' }}>Admin</span>
        </Link>
        <ul className="admin-nav">
          <li>
            <Link href="/admin/dashboard" className="admin-nav-item">Dashboard</Link>
          </li>
          <li>
            <Link href="/admin/mock-tests" className="admin-nav-item active">Mock Tests</Link>
          </li>
          <li>
            <Link href="/admin/questions" className="admin-nav-item">Questions</Link>
          </li>
          <li>
            <Link href="/admin/students" className="admin-nav-item">Students</Link>
          </li>
          <li>
            <Link href="/admin/access" className="admin-nav-item">Access Management</Link>
          </li>
        </ul>
      </aside>
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
