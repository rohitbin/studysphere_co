import { getDbData } from "@/lib/dataHandler";
import Link from "next/link";

export default async function AdminMainDashboard() {
  let results: any[] = [];
  let tests: any[] = [];
  
  try {
    const data = await getDbData();
    results = data.results || [];
    tests = data.tests || [];
  } catch (e) {
    console.error("Failed to read db", e);
  }

  const totalTests = tests.length;
  const publishedTests = tests.filter((t: any) => t.status === "Published").length;
  
  const totalSubmissions = results.length;
  const uniqueStudents = new Set(results.map((r: any) => r.studentId)).size;
  
  // Calculate students per test
  const testStats = tests.map((test: any) => {
    const testResults = results.filter((r: any) => r.mockTestId === test.id);
    const uniqueParticipants = new Set(testResults.map((r: any) => r.studentId)).size;
    const avgScore = testResults.length > 0 
      ? testResults.reduce((acc, r) => acc + r.stats.finalScore, 0) / testResults.length 
      : 0;
    
    return {
      ...test,
      totalAttempts: testResults.length,
      uniqueParticipants,
      avgScore
    };
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{ fontSize: '2rem' }}>Overview Dashboard</h1>
          <p className="text-muted mt-2">Welcome to StudySphere_co Admin. Here's what's happening today.</p>
        </div>
        <div className="flex gap-4">
           <Link href="/admin/mock-tests" className="btn btn-primary">+ Create New Test</Link>
        </div>
      </div>

      <div className="stats-grid mb-8" style={{ marginTop: '0', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="card text-center" style={{ backgroundColor: 'white' }}>
          <h3 className="text-muted" style={{ fontSize: '1rem', fontWeight: 600 }}>Total Students</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '1rem 0', color: 'var(--primary-navy)' }}>
            {uniqueStudents}
          </div>
        </div>
        <div className="card text-center" style={{ backgroundColor: 'white' }}>
          <h3 className="text-muted" style={{ fontSize: '1rem', fontWeight: 600 }}>Total Test Submissions</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '1rem 0', color: 'var(--primary-blue)' }}>
            {totalSubmissions}
          </div>
        </div>
        <div className="card text-center" style={{ backgroundColor: 'white' }}>
          <h3 className="text-muted" style={{ fontSize: '1rem', fontWeight: 600 }}>Active Tests</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '1rem 0', color: '#10b981' }}>
            {publishedTests} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {totalTests}</span>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Test Performance & Participation</h2>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Status</th>
              <th>Total Attempts</th>
              <th>Unique Students</th>
              <th>Average Score</th>
            </tr>
          </thead>
          <tbody>
            {testStats.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted">No tests available.</td>
              </tr>
            ) : testStats.map(test => (
              <tr key={test.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{test.title}</div>
                  <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{test.exam}</div>
                </td>
                <td>
                  <span className={`badge badge-${test.status}`}>{test.status}</span>
                </td>
                <td style={{ fontWeight: 600 }}>{test.totalAttempts}</td>
                <td style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>{test.uniqueParticipants} Students</td>
                <td>{test.avgScore.toFixed(2)} / {test.totalMarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
