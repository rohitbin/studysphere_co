import { getDbData, getQuestionsData } from "@/lib/dataHandler";
import { cookies } from "next/headers";
import ExamInterface from "@/components/ExamInterface";

export default async function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // 1. Fetch Test info
  let testInfo = null;
  try {
    const data = await getDbData();
    testInfo = (data.tests || []).find((t: any) => t.id === id);
  } catch (e) {}

  if (!testInfo) {
    return <div className="container py-20 text-center"><h1>Test not found.</h1></div>;
  }

  // 2. Fetch Questions that belong to this specific Mock Test
  let questions = [];
  try {
    const qData = await getQuestionsData();
    questions = (qData.questions || []).filter((q: any) => q.mockTestId === id);
  } catch (e) {}

  if (questions.length === 0) {
    return <div className="container py-20 text-center">
      <h1>No questions found for this test.</h1>
      <p className="text-muted mt-4">The Admin needs to add questions and assign them to this Mock Test (ID: {id}) in the Question Bank.</p>
    </div>;
  }

  const cookieStore = await cookies();
  const studentId = cookieStore.get('student_id')?.value || "Student_01";

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
       {/* Passing data to Client component for full interactivity */}
       <ExamInterface testInfo={testInfo} questions={questions} studentId={studentId} />
    </div>
  );
}
