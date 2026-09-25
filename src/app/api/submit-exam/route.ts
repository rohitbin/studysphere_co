import { NextResponse } from 'next/server';
import { getDbData, saveDbData, getQuestionsData } from '@/lib/dataHandler';

export async function POST(request: Request) {
  try {
    const { testId, studentId, answers, timeTaken } = await request.json();
    
    // Read questions
    const qData = await getQuestionsData();
    const allQuestions = qData.questions || [];
    const testQuestions = allQuestions.filter((q: any) => q.mockTestId === testId);

    // Read test info
    const dbData = await getDbData();
    const testInfo = (dbData.tests || []).find((t: any) => t.id === testId);

    if (!testQuestions.length || !testInfo) {
      return NextResponse.json({ error: "Test or questions not found" }, { status: 404 });
    }

    // Calculate score
    let totalMarks = 0;
    let totalQuestions = testQuestions.length;
    let attempted = 0;
    let correct = 0;
    let incorrect = 0;
    let totalEarned = 0;
    let totalNegative = 0;

    const questionResults: any = {};

    testQuestions.forEach((q: any) => {
      const studentAnswer = answers[q.id];
      if (studentAnswer) {
        attempted++;
        const isCorrect = studentAnswer === q.correctAnswer;
        if (isCorrect) {
          correct++;
          totalEarned += q.marks;
        } else {
          incorrect++;
          totalNegative += q.negativeMarks;
        }
        questionResults[q.id] = {
          studentAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect,
          marksEarned: isCorrect ? q.marks : -q.negativeMarks
        };
      } else {
        questionResults[q.id] = {
          studentAnswer: null,
          correctAnswer: q.correctAnswer,
          isCorrect: false,
          marksEarned: 0
        };
      }
      totalMarks += q.marks;
    });

    const finalScore = totalEarned - totalNegative;
    const isPassed = true; // Passing percentage removed

    const result = {
      id: `RES${Math.floor(Math.random() * 1000000)}`,
      testId,
      studentId: studentId || "Anonymous", // Usually from session
      date: new Date().toISOString(),
      timeTaken,
      stats: {
        totalQuestions,
        attempted,
        correct,
        incorrect,
        totalMarks,
        finalScore,
        totalEarned,
        totalNegative,
        isPassed
      },
      questionResults
    };

    // Save result to db.json
    dbData.results = dbData.results || [];
    dbData.results.push(result);
    await saveDbData(dbData);

    return NextResponse.json({ success: true, resultId: result.id, result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to submit exam" }, { status: 500 });
  }
}
