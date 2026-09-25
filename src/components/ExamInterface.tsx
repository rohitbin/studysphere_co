"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type QuestionStatus = "unvisited" | "answered" | "not_answered" | "marked";

interface Question {
  id: string;
  subject: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
}

export default function ExamInterface({ testInfo, questions, studentId }: { testInfo: any, questions: Question[], studentId: string }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [statusMap, setStatusMap] = useState<Record<string, QuestionStatus>>(() => {
    const map: Record<string, QuestionStatus> = {};
    questions.forEach(q => { map[q.id] = "unvisited"; });
    if (questions.length > 0) map[questions[0].id] = "not_answered";
    return map;
  });

  // Timer logic
  const [timeLeft, setTimeLeft] = useState(testInfo.duration * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-submit when time reaches 0
  const hasAutoSubmitted = useRef(false);
  useEffect(() => {
    if (timeLeft <= 0 && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      submitExam();
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];
  const currentSubject = currentQ?.subject;
  const subjects = Array.from(new Set(questions.map(q => q.subject)));

  const jumpToSubject = (subject: string) => {
    const firstIndex = questions.findIndex(q => q.subject === subject);
    if (firstIndex !== -1 && firstIndex !== currentIndex) {
      changeQuestion(firstIndex);
    }
  };

  const handleOptionSelect = (optionValue: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: optionValue }));
  };

  const changeQuestion = (index: number) => {
    // Update status of current question if leaving it
    setStatusMap(prev => {
      const currentStatus = prev[currentQ.id];
      let newStatus = currentStatus;
      
      // If we haven't marked it for review, set based on answer existence
      if (currentStatus !== "marked") {
        newStatus = answers[currentQ.id] ? "answered" : "not_answered";
      }

      const nextQId = questions[index].id;
      // Mark next question as not_answered if it was unvisited
      const nextStatus = prev[nextQId] === "unvisited" ? "not_answered" : prev[nextQId];

      return { ...prev, [currentQ.id]: newStatus, [nextQId]: nextStatus };
    });
    
    setCurrentIndex(index);
  };

  const handleSaveAndNext = () => {
    setStatusMap(prev => ({ ...prev, [currentQ.id]: "answered" }));
    if (currentIndex < questions.length - 1) {
      changeQuestion(currentIndex + 1);
    }
  };

  const handleMarkForReview = () => {
    setStatusMap(prev => ({ ...prev, [currentQ.id]: "marked" }));
    if (currentIndex < questions.length - 1) {
      changeQuestion(currentIndex + 1);
    }
  };

  const handleClearResponse = () => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQ.id];
      return newAnswers;
    });
    setStatusMap(prev => ({ ...prev, [currentQ.id]: "not_answered" }));
  };

  const submitExam = async () => {
    setIsSubmitting(true);
    const timeTaken = (testInfo.duration * 60) - timeLeft;

    try {
      const res = await fetch('/api/submit-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: testInfo.id,
          studentId: studentId,
          answers,
          timeTaken
        })
      });
      const data = await res.json();

      if (data.success) {
        router.push(`/mock-tests/${testInfo.id}/result/${data.resultId}`);
        setIsSubmitting(false);
      } else {
        alert("Error submitting exam: " + data.error);
        setIsSubmitting(false);
      }
    } catch (err) {
      alert("Network error submitting exam.");
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: QuestionStatus) => {
    switch(status) {
      case "answered": return "var(--status-green)";
      case "not_answered": return "var(--status-red)";
      case "marked": return "#8B5CF6"; // Purple
      case "unvisited": default: return "var(--accent-gray)";
    }
  };

  // Counts for legend
  const counts = {
    answered: Object.values(statusMap).filter(s => s === 'answered').length,
    not_answered: Object.values(statusMap).filter(s => s === 'not_answered').length,
    marked: Object.values(statusMap).filter(s => s === 'marked').length,
    unvisited: Object.values(statusMap).filter(s => s === 'unvisited').length,
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      {/* Exam Header */}
      <header style={{ backgroundColor: 'var(--primary-navy)', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{testInfo.title}</h2>
          <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>{testInfo.exam}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⏱️ {formatTime(timeLeft)}
          </div>
          <button className="btn btn-primary" style={{ backgroundColor: 'var(--status-red)' }} disabled={isSubmitting} onClick={() => { if(confirm("Are you sure you want to submit the exam?")) submitExam() }}>
            {isSubmitting ? "Submitting..." : "Submit Exam"}
          </button>
        </div>
      </header>

      {/* Sections Bar */}
      {subjects.length > 1 && (
        <div style={{ backgroundColor: 'white', borderBottom: '1px solid var(--accent-gray)', display: 'flex', overflowX: 'auto' }}>
          {subjects.map(subj => (
            <button 
              key={subj}
              onClick={() => jumpToSubject(subj)}
              style={{
                padding: '1rem 2rem',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: currentSubject === subj ? '3px solid var(--primary-blue)' : '3px solid transparent',
                color: currentSubject === subj ? 'var(--primary-blue)' : 'var(--text-muted)',
                fontWeight: currentSubject === subj ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {subj}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Split */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Side: Question Area */}
        <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', overflowY: 'auto', borderRight: '1px solid var(--accent-gray)', backgroundColor: 'white' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--accent-gray)', paddingBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Question {currentIndex + 1} <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>of {questions.length}</span></h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--primary-blue)', fontWeight: 600 }}>
              {currentQ.subject}
            </div>
          </div>

          <div style={{ fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            {currentQ.questionText}
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: 'auto' }}>
            {[currentQ.option1, currentQ.option2, currentQ.option3, currentQ.option4].map((opt, i) => {
              const optionNumber = (i + 1).toString();
              const isSelected = answers[currentQ.id] === optionNumber;
              return (
                <label 
                  key={i} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '1rem', 
                    border: `1px solid ${isSelected ? 'var(--primary-blue)' : 'var(--accent-gray)'}`, 
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(26, 115, 232, 0.05)' : 'transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input 
                    type="radio" 
                    name="question_option" 
                    value={optionNumber}
                    checked={isSelected}
                    onChange={() => handleOptionSelect(optionNumber)}
                    style={{ marginRight: '1rem', transform: 'scale(1.2)' }}
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--accent-gray)' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
               <button className="btn btn-outline" onClick={handleMarkForReview}>Mark for Review & Next</button>
               <button className="btn btn-outline" onClick={handleClearResponse}>Clear Response</button>
            </div>
            <button className="btn btn-primary" onClick={handleSaveAndNext} disabled={!answers[currentQ.id]}>
              Save & Next
            </button>
          </div>
        </div>

        {/* Right Side: Question Palette */}
        <div style={{ width: '300px', backgroundColor: '#f8f9fa', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--accent-gray)', backgroundColor: 'white' }}>
             <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Question Palette</h3>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: getStatusColor('answered') }}></div> Answered ({counts.answered})</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: getStatusColor('not_answered') }}></div> Not Answered ({counts.not_answered})</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: getStatusColor('unvisited'), border: '1px solid #ccc' }}></div> Unvisited ({counts.unvisited})</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: getStatusColor('marked') }}></div> Marked ({counts.marked})</div>
             </div>
          </div>

          <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
            <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--accent-gray)', paddingBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{currentSubject} Section</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
              {questions.map((q, i) => {
                if (q.subject !== currentSubject) return null;
                const status = statusMap[q.id] || "unvisited";
                return (
                  <button
                    key={q.id}
                    onClick={() => changeQuestion(i)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: getStatusColor(status),
                      color: (status === 'unvisited') ? 'black' : 'white',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      borderWidth: status === 'unvisited' ? '1px' : '0',
                      borderStyle: 'solid',
                      borderColor: '#ccc',
                      opacity: currentIndex === i ? 0.7 : 1,
                      boxShadow: currentIndex === i ? '0 0 0 3px var(--primary-blue)' : 'none'
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

    </div>
      
      {/* Submitting Overlay */}
      {isSubmitting && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(10px)' }}>
          <div style={{ width: '64px', height: '64px', border: '4px solid var(--accent-gray)', borderTopColor: 'var(--primary-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '2rem' }}></div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary-navy)' }}>
            {timeLeft <= 0 ? "Time's up!" : "Submitting Exam"}
          </h2>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>Please wait while we save your responses and calculate your score...</p>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}} />
        </div>
      )}
    </>
  );
}
