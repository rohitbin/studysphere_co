"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Question {
  id: string;
  subject: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctAnswer: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
  marks: number;
  negativeMarks: number;
  mockTestId?: string;
}

export default function TestQuestionsManager() {
  const params = useParams();
  const testId = params.testId as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [testInfo, setTestInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [uploadTargetSubject, setUploadTargetSubject] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Question>>({
    difficulty: "Medium",
    correctAnswer: "1",
    marks: 2,
    negativeMarks: 0.66
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/questions').then(res => res.json()),
      fetch('/api/tests').then(res => res.json())
    ]).then(([qData, tData]) => {
      // Filter questions to only this test
      const filtered = (qData.questions || []).filter((q: Question) => q.mockTestId === testId);
      setQuestions(filtered);
      
      const t = (tData.tests || []).find((t: any) => t.id === testId);
      setTestInfo(t);
      
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [testId]);

  const saveToDB = async (updatedFilteredQuestions: Question[]) => {
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: updatedFilteredQuestions })
      });
      
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to save questions");
      
      // Update UI only if DB save succeeded
      setQuestions(updatedFilteredQuestions);
    } catch (error: any) {
      console.error("Failed to save to DB:", error);
      alert(error.message || "Failed to upload questions to database.");
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    const updatedTestInfo = {
      ...testInfo,
      subjects: [...(testInfo.subjects || []), newSubjectName.trim()]
    };
    
    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tests: [updatedTestInfo] })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to save subject");
      
      setTestInfo(updatedTestInfo);
      setIsSubjectModalOpen(false);
      setNewSubjectName("");
    } catch (error: any) {
      console.error("Failed to add subject", error);
      alert(error.message || "Failed to save subject to database.");
    }
  };

  const handleDeleteSubject = async (subj: string) => {
    if (!confirm(`Are you sure you want to delete the subject "${subj}"? This will ALSO delete all questions inside it. This cannot be undone.`)) return;

    // 1. Remove subject from testInfo
    const updatedSubjects = (testInfo.subjects || []).filter((s: string) => s !== subj);
    const updatedTestInfo = { ...testInfo, subjects: updatedSubjects };
    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tests: [updatedTestInfo] })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete subject");
      
      setTestInfo(updatedTestInfo);
    } catch (error: any) {
      console.error("Failed to update test after deleting subject", error);
      alert(error.message || "Failed to update test in database.");
      return; // Stop execution to prevent deleting questions if the test update failed
    }

    // 2. Remove all questions under this subject
    const idsToDelete = questions.filter(q => q.subject === subj).map(q => q.id);
    if (idsToDelete.length > 0) {
      try {
        const res = await fetch('/api/questions', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: idsToDelete })
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to delete questions");
        setQuestions(questions.filter(q => q.subject !== subj));
      } catch (error: any) {
        console.error("Failed to delete questions", error);
        alert(error.message || "Failed to delete questions from database.");
      }
    }
  };

  const handleOpenModal = (subjectName: string, q?: Question) => {
    if (q) {
      setCurrentQuestion(q);
      setFormData(q);
    } else {
      setCurrentQuestion(null);
      setFormData({
        subject: subjectName, questionText: "",
        option1: "", option2: "", option3: "", option4: "",
        correctAnswer: "1", explanation: "", difficulty: "Medium",
        marks: 2, negativeMarks: 0.66
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let updated;
    if (currentQuestion) {
      updated = questions.map(q => q.id === currentQuestion.id ? { ...q, ...formData, mockTestId: testId } as Question : q);
    } else {
      const newQ: Question = {
        ...(formData as Question),
        id: `Q${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        mockTestId: testId
      };
      updated = [...questions, newQ];
    }
    saveToDB(updated);
    setIsModalOpen(false);
  };

  const confirmDelete = (id: string) => {
    setQuestionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (questionToDelete) {
      try {
        const res = await fetch('/api/questions', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: [questionToDelete] })
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to delete question");
        setQuestions(questions.filter(q => q.id !== questionToDelete));
      } catch (error: any) {
        console.error("Failed to delete question", error);
        alert(error.message || "Failed to delete question from database.");
      }
    }
    setIsDeleteModalOpen(false);
    setQuestionToDelete(null);
  };

  const toggleQuestionSelection = (id: string) => {
    const newSet = new Set(selectedQuestions);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedQuestions(newSet);
  };

  const toggleSelectAll = (subjQuestions: Question[]) => {
    const newSet = new Set(selectedQuestions);
    const allSelected = subjQuestions.every(q => newSet.has(q.id));
    if (allSelected) {
      subjQuestions.forEach(q => newSet.delete(q.id));
    } else {
      subjQuestions.forEach(q => newSet.add(q.id));
    }
    setSelectedQuestions(newSet);
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedQuestions.size} selected questions? This cannot be undone.`)) return;
    
    const idsToDelete = Array.from(selectedQuestions);
    try {
      const res = await fetch('/api/questions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to bulk delete questions");
      setQuestions(questions.filter(q => !selectedQuestions.has(q.id)));
      setSelectedQuestions(new Set());
    } catch (error: any) {
      console.error("Failed to bulk delete", error);
      alert(error.message || "Failed to bulk delete questions from database.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // CSV Parsing Logic
  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length <= 1) {
        alert("CSV is empty or missing data rows.");
        return;
      }
      
      const newQuestions: Question[] = [];
      let errors = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const row = [];
        let inQuotes = false;
        let current = "";
        for (let j = 0; j < line.length; j++) {
          if (line[j] === '"') inQuotes = !inQuotes;
          else if (line[j] === ',' && !inQuotes) { row.push(current.trim()); current = ""; }
          else current += line[j];
        }
        row.push(current.trim());
        const cleanedRow = row.map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"'));

        if (cleanedRow.length < 11) {
          errors++;
          continue;
        }

        let correctOpt = cleanedRow[5];
        // If they provided the text instead of the option number, find the option number
        if (!['1', '2', '3', '4'].includes(correctOpt)) {
          if (correctOpt === cleanedRow[1]) correctOpt = '1';
          else if (correctOpt === cleanedRow[2]) correctOpt = '2';
          else if (correctOpt === cleanedRow[3]) correctOpt = '3';
          else if (correctOpt === cleanedRow[4]) correctOpt = '4';
          else correctOpt = '1'; // Fallback
        }

        newQuestions.push({
          id: `Q${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          questionText: cleanedRow[0],
          option1: cleanedRow[1],
          option2: cleanedRow[2],
          option3: cleanedRow[3],
          option4: cleanedRow[4],
          correctAnswer: correctOpt,
          explanation: cleanedRow[6],
          subject: uploadTargetSubject || cleanedRow[7] || "",
          difficulty: cleanedRow[8] as "Easy" | "Medium" | "Hard",
          marks: Number(cleanedRow[9]) || 2,
          negativeMarks: Number(cleanedRow[10]) || 0,
          mockTestId: testId // Auto assign!
        });
      }

      if (newQuestions.length > 0) {
        await saveToDB([...questions, ...newQuestions]);
        alert(`Successfully imported ${newQuestions.length} questions to ${testId}. ${errors > 0 ? `(${errors} rows failed)` : ''}`);
      } else {
        alert("No valid questions found in CSV.");
      }
      
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadTargetSubject(null); // Reset after upload
    };
    reader.readAsText(file);
  };

  if (isLoading) return <div className="py-20 text-center">Loading...</div>;

  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/questions" className="text-muted" style={{ textDecoration: 'none' }}>
          ← Back to All Mock Tests
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{ fontSize: '2rem' }}>Managing: {testInfo?.title || testId}</h1>
          <p className="text-muted mt-2">Add, edit, delete, and bulk upload questions specifically for this test.</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleBulkUpload} 
            style={{ display: 'none' }} 
          />
          {selectedQuestions.size > 0 && (
            <button className="btn btn-primary" style={{ backgroundColor: 'var(--status-red)', border: 'none' }} onClick={handleBulkDelete}>
              🗑️ Delete Selected ({selectedQuestions.size})
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setIsSubjectModalOpen(true)}>
            + Add Subject
          </button>
        </div>
      </div>

      <div className="card mb-8">
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          <strong>CSV Format Required:</strong> question, option1, option2, option3, option4, correct_answer, explanation, subject, difficulty, marks, negative_marks
          <br/><br/>
          <em>Note: When uploading to a specific subject, the CSV's "subject" column (column 8) will be automatically overridden by your chosen subject!</em>
        </p>
      </div>

      {/* Group Questions by Subject */}
      {(() => {
        const displaySubjects = Array.from(new Set([
          ...(testInfo?.subjects || []),
          ...questions.map(q => q.subject)
        ])).filter(Boolean); // filter out any empty string subjects

        if (displaySubjects.length === 0) {
          return (
            <div className="card text-center py-10">
              <h3 className="text-muted">No subjects added yet.</h3>
              <p className="text-muted mt-2">Add a subject first before you can add questions.</p>
              <button className="btn btn-primary mt-4" onClick={() => setIsSubjectModalOpen(true)}>+ Add Subject</button>
            </div>
          );
        }

        return displaySubjects.map((subj: string) => {
          const subjQuestions = questions.filter(q => q.subject === subj);
          return (
            <div key={subj} className="card mb-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <h2 style={{ fontSize: '1.5rem', color: 'var(--primary-navy)', margin: 0 }}>{subj}</h2>
                  <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', color: 'var(--status-red)', borderColor: 'var(--status-red)' }} onClick={() => handleDeleteSubject(subj)}>
                    🗑️ Delete Subject
                  </button>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }} onClick={() => {
                    setUploadTargetSubject(subj);
                    fileInputRef.current?.click();
                  }}>
                    ⬆️ Bulk Upload to {subj}
                  </button>
                  <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }} onClick={() => handleOpenModal(subj)}>
                    + Add Question to {subj}
                  </button>
                </div>
              </div>
              
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input 
                          type="checkbox" 
                          style={{ transform: 'scale(1.2)' }}
                          checked={subjQuestions.length > 0 && subjQuestions.every(q => selectedQuestions.has(q.id))}
                          onChange={() => toggleSelectAll(subjQuestions)}
                        />
                      </th>
                      <th>Question</th>
                      <th>Difficulty / Marks</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjQuestions.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-8 text-muted">No questions found in {subj}.</td></tr>
                    ) : subjQuestions.map(q => (
                      <tr key={q.id}>
                        <td>
                          <input 
                            type="checkbox" 
                            style={{ transform: 'scale(1.2)' }}
                            checked={selectedQuestions.has(q.id)} 
                            onChange={() => toggleQuestionSelection(q.id)} 
                          />
                        </td>
                        <td style={{ maxWidth: '400px' }}>
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.questionText}</div>
                          <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Ans: Option {q.correctAnswer}</div>
                        </td>
                        <td>
                          <span className={`badge badge-${q.difficulty}`}>{q.difficulty}</span>
                          <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>+{q.marks} / -{q.negativeMarks}</div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex justify-end gap-2">
                            <button className="action-btn" title="Edit" onClick={() => handleOpenModal(subj, q)}>✏️</button>
                            <button className="action-btn delete" title="Delete" onClick={() => confirmDelete(q.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        });
      })()}

      {/* Add Subject Modal */}
      {isSubjectModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Add New Subject</h2>
              <button className="modal-close" onClick={() => setIsSubjectModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddSubject}>
              <div className="form-group">
                <label className="form-label">Subject Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={newSubjectName} 
                  onChange={e => setNewSubjectName(e.target.value)} 
                  placeholder="e.g. Mathematics, History, Physics" 
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsSubjectModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '900px' }}>
            <div className="modal-header">
              <h2>{currentQuestion ? 'Edit Question' : 'Add New Question'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input type="text" name="subject" className="form-control" required value={formData.subject || ''} readOnly style={{ backgroundColor: 'var(--accent-gray)', cursor: 'not-allowed' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Question Text</label>
                <textarea name="questionText" className="form-control" rows={3} required value={formData.questionText || ''} onChange={handleInputChange}></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Option 1</label>
                  <input type="text" name="option1" className="form-control" required value={formData.option1 || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Option 2</label>
                  <input type="text" name="option2" className="form-control" required value={formData.option2 || ''} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Option 3</label>
                  <input type="text" name="option3" className="form-control" required value={formData.option3 || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Option 4</label>
                  <input type="text" name="option4" className="form-control" required value={formData.option4 || ''} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Correct Answer</label>
                  <select name="correctAnswer" className="form-control" required value={formData.correctAnswer || '1'} onChange={handleInputChange}>
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                    <option value="3">Option 3</option>
                    <option value="4">Option 4</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select name="difficulty" className="form-control" required value={formData.difficulty || 'Medium'} onChange={handleInputChange}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Marks</label>
                  <input type="number" step="0.5" name="marks" className="form-control" required value={formData.marks || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Negative Marks</label>
                  <input type="number" step="0.01" name="negativeMarks" className="form-control" required value={formData.negativeMarks || ''} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Explanation (Optional)</label>
                <textarea name="explanation" className="form-control" rows={2} value={formData.explanation || ''} onChange={handleInputChange}></textarea>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{currentQuestion ? 'Update Question' : 'Save Question'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--status-red)' }}>Delete Question?</h3>
            <p className="text-muted">Are you sure you want to delete this question? This action cannot be undone.</p>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ backgroundColor: 'var(--status-red)' }} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
