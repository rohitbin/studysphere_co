import Link from "next/link";

export default function Home() {
  return (
    <div className="container py-20">
      <section className="text-center">
        <h1>UPSC & Competitive Exam Mock Tests</h1>
        <p className="hero-subtitle">
          Practice with exam-oriented mock tests and analyze your preparation. Get instant results, detailed performance analysis, and track your previous attempt history.
        </p>
        
        <div className="flex justify-center gap-4">
          <Link href="/mock-tests" className="btn btn-primary">
            Explore Mock Tests
          </Link>
          <Link href="/login" className="btn btn-outline">
            Student Login
          </Link>
        </div>
      </section>

      <section className="stats-grid">
        <div className="card stat-card">
          <div className="stat-value">5+</div>
          <div className="stat-label">Mock Tests</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">500+</div>
          <div className="stat-label">Questions</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">10k+</div>
          <div className="stat-label">Total Attempts</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">2,500+</div>
          <div className="stat-label">Students Registered</div>
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-center mb-8">Platform Features</h3>
        <div className="stats-grid" style={{ marginTop: '2rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h4 className="mb-2">Exam-like Interface</h4>
            <p className="text-muted">Practice in a simulated environment similar to real competitive exams to build confidence.</p>
          </div>
          <div className="card" style={{ padding: '2rem' }}>
            <h4 className="mb-2">Detailed Analytics</h4>
            <p className="text-muted">Get comprehensive performance analysis with question-wise accuracy and time tracking.</p>
          </div>
          <div className="card" style={{ padding: '2rem' }}>
            <h4 className="mb-2">Secure Test Access</h4>
            <p className="text-muted">Access Premium Mock Tests with unique IDs and Passwords directly provided by the admin.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
