import { getDbData } from "@/lib/dataHandler";
import React, { Suspense } from "react";
import MockTestList from "@/components/MockTestList";

// Types
type TestStatus = "Draft" | "Published" | "Archived";

interface MockTest {
  id: string;
  title: string;
  exam: string;
  description: string;
  duration: number;
  totalMarks: number;
  questionCount: number;
  negativeMarking: string;
  price: number;
  status: TestStatus;
  accessId?: string;
  accessPassword?: string;
  coverImage?: string;
  upiId?: string;
  qrCode?: string;
}

// Fetch from the local JSON database
async function getActiveTests(): Promise<MockTest[]> {
  try {
    const parsed = await getDbData();
    const allTests: MockTest[] = parsed.tests || [];
    
    // ONLY return tests that the Admin has marked as "Published" (Live)
    return allTests.filter(test => test.status === "Published");
  } catch (error) {
    console.error("Error reading db:", error);
    return [];
  }
}

export default async function MockTestsPage() {
  const activeTests = await getActiveTests();

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2>Available Mock Tests</h2>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary-blue)', marginTop: '0.5rem' }}>UPSC, SSC & Other Competitive Exam Mock Tests</p>
          <p className="text-muted mt-1">Practice and track your progress with our premium tests.</p>
        </div>
      </div>

      {/* Render the Client Component for interactivity (Modals) */}
      <Suspense fallback={<div className="text-center py-10">Loading tests...</div>}>
        <MockTestList tests={activeTests} />
      </Suspense>
    </div>
  );
}
