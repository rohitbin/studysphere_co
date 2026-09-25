import { getDbData, getQuestionsData } from "@/lib/dataHandler";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";

export default async function ResultPage({ params }: { params: Promise<{ id: string, resultId: string }> }) {
  const { id, resultId } = await params;

  // Fetch from DB
  let resultInfo = null;
  let testInfo = null;
  try {
    const data = await getDbData();
    resultInfo = (data.results || []).find((r: any) => r.id === resultId);
    testInfo = (data.tests || []).find((t: any) => t.id === id);
  } catch (e) {}

  if (!resultInfo || !testInfo) {
    return <div className="container py-20 text-center"><h1>Result not found.</h1></div>;
  }

  let questions: any[] = [];
  try {
    const qData = await getQuestionsData();
    questions = qData.questions || [];
  } catch (e) {}

  const stats = resultInfo.stats;
  // removed isPassed

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Performance Dashboard</h1>
            <p className="text-muted">{testInfo.title} • Submitted on {new Date(resultInfo.date).toLocaleDateString()}</p>
          </div>
          <div className="no-print" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <PrintButton />
            <Link href="/mock-tests" className="btn btn-outline">
              ← Back to Tests
            </Link>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="stats-grid mb-8">
          <div className="card text-center" style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', borderColor: 'var(--primary-blue)' }}>
            <h3 style={{ color: 'var(--primary-blue)', fontSize: '1.2rem' }}>
              📊 TOTAL SCORE
            </h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '1rem 0' }}>
              {stats.finalScore.toFixed(2)} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/ {stats.totalMarks}</span>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--accent-gray)' }}>
              <span className="text-muted">Total Questions</span>
              <span style={{ fontWeight: 600 }}>{stats.totalQuestions}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--accent-gray)' }}>
              <span className="text-muted">Attempted</span>
              <span style={{ fontWeight: 600, color: 'var(--primary-blue)' }}>{stats.attempted}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--accent-gray)' }}>
              <span className="text-muted">Not Attempted</span>
              <span style={{ fontWeight: 600 }}>{stats.totalQuestions - stats.attempted}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Accuracy</span>
              <span style={{ fontWeight: 600 }}>
                {stats.attempted > 0 ? ((stats.correct / stats.attempted) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--accent-gray)' }}>
              <span className="text-muted">Correct Answers</span>
              <span style={{ fontWeight: 600, color: 'var(--status-green)' }}>{stats.correct} (+{stats.totalEarned.toFixed(2)})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--accent-gray)' }}>
              <span className="text-muted">Incorrect Answers</span>
              <span style={{ fontWeight: 600, color: 'var(--status-red)' }}>{stats.incorrect} (-{stats.totalNegative.toFixed(2)})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Time Taken</span>
              <span style={{ fontWeight: 600 }}>{Math.floor(resultInfo.timeTaken / 60)}m {resultInfo.timeTaken % 60}s</span>
            </div>
          </div>
        </div>

        {/* Detailed Solutions */}
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--primary-blue)', paddingBottom: '0.5rem', display: 'inline-block' }}>
          Detailed Solutions
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {questions.filter(q => q.mockTestId === id).map((q, i) => {
            const res = resultInfo.questionResults[q.id] || { studentAnswer: null, correctAnswer: q.correctAnswer, isCorrect: false, marksEarned: 0 };
            const isAttempted = res.studentAnswer !== null;
            let statusColor = 'var(--accent-gray)';
            let statusBadge = 'Skipped';
            
            if (isAttempted) {
              if (res.isCorrect) {
                statusColor = 'var(--status-green)';
                statusBadge = 'Correct';
              } else {
                statusColor = 'var(--status-red)';
                statusBadge = 'Incorrect';
              }
            }

            return (
              <div key={q.id} className="card" style={{ borderLeft: `4px solid ${statusColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--primary-blue)' }}>Q{i + 1}. {q.subject}</div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: res.marksEarned > 0 ? 'var(--status-green)' : res.marksEarned < 0 ? 'var(--status-red)' : 'var(--text-muted)' }}>
                      {res.marksEarned > 0 ? '+' : ''}{res.marksEarned} marks
                    </span>
                    <span className="badge" style={{ backgroundColor: statusColor, color: 'white', border: 'none' }}>
                      {statusBadge}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  {q.questionText}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[q.option1, q.option2, q.option3, q.option4].map((opt, optIdx) => {
                    const optNum = (optIdx + 1).toString();
                    const isStudentAnswer = res.studentAnswer === optNum;
                    const isCorrectAnswer = q.correctAnswer === optNum;
                    
                    let bg = 'white';
                    let border = 'var(--accent-gray)';
                    if (isCorrectAnswer) {
                      bg = 'rgba(16, 185, 129, 0.1)';
                      border = 'var(--status-green)';
                    } else if (isStudentAnswer && !isCorrectAnswer) {
                      bg = 'rgba(239, 68, 68, 0.1)';
                      border = 'var(--status-red)';
                    }

                    return (
                      <div key={optIdx} style={{ padding: '1rem', border: `1px solid ${border}`, borderRadius: 'var(--radius-md)', backgroundColor: bg, display: 'flex', alignItems: 'center' }}>
                        <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: isCorrectAnswer ? 'var(--status-green)' : isStudentAnswer ? 'var(--status-red)' : 'var(--accent-gray)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', marginRight: '1rem' }}>
                          {optNum}
                        </span>
                        {opt}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-gray)', fontSize: '0.9rem' }}>
                    <strong>Explanation:</strong><br/>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
