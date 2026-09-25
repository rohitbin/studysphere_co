import { getDbData } from "@/lib/dataHandler";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function StudentDashboard() {
  let results: any[] = [];
  let tests: any[] = [];

  try {
    const data = await getDbData();
    results = data.results || [];
    tests = data.tests || [];
  } catch (e) {
    console.error("Failed to read db", e);
  }

  const cookieStore = await cookies();
  const studentId = cookieStore.get('student_id')?.value || "Student_01";
  
  // Filter for this student's results
  const studentResults = results.filter(r => r.studentId === studentId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const totalAttempts = studentResults.length;
  const avgAccuracy = totalAttempts > 0 
    ? studentResults.reduce((acc, curr) => acc + (curr.stats.attempted > 0 ? (curr.stats.correct / curr.stats.attempted) : 0), 0) / totalAttempts 
    : 0;

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>My Dashboard</h1>
            <p className="text-muted">Welcome back, Student! View your progress and history.</p>
          </div>
          <Link href="/mock-tests" className="btn btn-primary">
            Explore New Tests
          </Link>
        </div>

        {/* Aggregate Stats */}
        <div className="stats-grid mb-8" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="card text-center">
            <h3 className="text-muted" style={{ fontSize: '1rem', fontWeight: 600 }}>Total Tests Attempted</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '1rem 0', color: 'var(--primary-navy)' }}>
              {totalAttempts}
            </div>
          </div>
          <div className="card text-center">
            <h3 className="text-muted" style={{ fontSize: '1rem', fontWeight: 600 }}>Average Accuracy</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '1rem 0', color: 'var(--primary-blue)' }}>
              {(avgAccuracy * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Recent Attempts History */}
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--primary-blue)', paddingBottom: '0.5rem', display: 'inline-block' }}>
          Attempt History
        </h2>

        {studentResults.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="text-muted">You haven't attempted any tests yet.</h3>
            <p className="text-muted mt-2">Go explore the available mock tests to start your journey!</p>
            <Link href="/mock-tests" className="btn btn-primary mt-4">Browse Mock Tests</Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Mock Test</th>
                  <th>Score</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {studentResults.map((result) => {
                  const test = tests.find(t => t.id === result.testId);
                  return (
                    <tr key={result.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600 }}>{new Date(result.date).toLocaleDateString()}</div>
                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>{new Date(result.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{test?.title || result.testId}</div>
                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>ID: {result.testId}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{result.stats.finalScore.toFixed(2)} <span className="text-muted" style={{ fontSize: '0.85rem' }}>/ {result.stats.totalMarks}</span></div>
                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>Accuracy: {result.stats.attempted > 0 ? ((result.stats.correct / result.stats.attempted) * 100).toFixed(1) : 0}%</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link href={`/mock-tests/${result.testId}/result/${result.id}`} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
                          View Report →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
