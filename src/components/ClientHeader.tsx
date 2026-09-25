"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ClientHeader() {
  const pathname = usePathname();

  // Hide the global header on admin pages or during the actual exam
  if (pathname?.startsWith("/admin") || pathname?.endsWith("/exam")) {
    return null;
  }

  return (
    <header className="header no-print">
      <div className="container header-container">
        <Link href="/" className="logo">
          StudySphere_co
        </Link>
        
        <nav>
          <ul className="nav-links">
            <li><Link href="/mock-tests" className="nav-link">Mock Tests</Link></li>
            <li><Link href="/results" className="nav-link">Results</Link></li>
            <li><Link href="/instructions" className="nav-link">Instructions</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
