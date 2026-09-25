"use client";

import { useState, useEffect } from "react";

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
  validUntil?: string;
  availableFrom?: string;
}

export default function AdminMockTests() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentTest, setCurrentTest] = useState<MockTest | null>(null);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<MockTest>>({
    status: "Draft",
    negativeMarking: "0",
    price: 0
  });

  // Fetch tests on mount
  useEffect(() => {
    fetch('/api/tests')
      .then(res => res.json())
      .then(data => {
        setTests(data.tests || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  // Helper to save to API
  const saveToDB = async (updatedTests: MockTest[]) => {
    setTests(updatedTests);
    await fetch('/api/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tests: updatedTests })
    });
  };

  const handleOpenModal = (test?: MockTest) => {
    if (test) {
      setCurrentTest(test);
      setFormData(test);
    } else {
      setCurrentTest(null);
      setFormData({
        status: "Draft",
        negativeMarking: "0",
        price: 0,
        title: "",
        exam: "",
        description: "",
        duration: 0,
        totalMarks: 0,
        questionCount: 0,
        accessId: "",
        accessPassword: "",
        coverImage: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTest(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedTests;
    if (currentTest) {
      // Edit
      updatedTests = tests.map(t => t.id === currentTest.id ? { ...t, ...formData } as MockTest : t);
    } else {
      // Create
      const newTest: MockTest = {
        ...(formData as MockTest),
        id: `MT${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
      };
      updatedTests = [...tests, newTest];
    }
    saveToDB(updatedTests);
    handleCloseModal();
  };

  const confirmDelete = (id: string) => {
    setTestToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (testToDelete) {
      try {
        const res = await fetch('/api/tests', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: testToDelete })
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to delete test");
        setTests(tests.filter(t => t.id !== testToDelete));
      } catch (error: any) {
        console.error("Failed to delete test", error);
        alert(error.message || "Failed to delete test from database.");
      }
    }
    setIsDeleteModalOpen(false);
    setTestToDelete(null);
  };

  const handleDuplicate = (test: MockTest) => {
    const newTest: MockTest = {
      ...test,
      id: `MT${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      title: `${test.title} (Copy)`,
      status: "Draft"
    };
    saveToDB([...tests, newTest]);
  };

  const handleStatusChange = (id: string, newStatus: TestStatus) => {
    saveToDB(tests.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'coverImage' | 'qrCode') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (json.success) {
        setFormData(prev => ({ ...prev, [fieldName]: json.url }));
      } else {
        alert("Upload failed: " + json.error);
      }
    } catch (err) {
      alert("Error uploading image");
    }
  };

  const handleRemoveImage = async (fieldName: 'coverImage' | 'qrCode') => {
    if (formData[fieldName]) {
      try {
        await fetch("/api/upload-image", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: formData[fieldName] })
        });
      } catch (e) {
        console.error("Failed to delete physical image", e);
      }
      setFormData(prev => ({ ...prev, [fieldName]: "" }));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{ fontSize: '2rem' }}>Mock Test Management</h1>
          <p className="text-muted mt-2">Create, edit, publish, and manage all your mock tests.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          + Create New Test
        </button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ID / Title</th>
              <th>Exam</th>
              <th>Questions / Marks</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
               <tr>
               <td colSpan={5} className="text-center py-8 text-muted">Loading tests...</td>
             </tr>
            ) : tests.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted">No mock tests found. Create one to get started.</td>
              </tr>
            ) : tests.map(test => (
              <tr key={test.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{test.title}</div>
                  <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{test.id}</div>
                </td>
                <td>{test.exam}</td>
                <td>
                  <div>{test.questionCount} Qs</div>
                  <div className="text-muted" style={{ fontSize: '0.85rem' }}>{test.totalMarks} Marks</div>
                </td>
                <td>
                  <span className={`badge badge-${test.status}`}>{test.status}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="flex justify-end gap-2">
                    <button className="action-btn" title="Edit" onClick={() => handleOpenModal(test)}>✏️</button>
                    <button className="action-btn" title="Duplicate" onClick={() => handleDuplicate(test)}>📋</button>
                    <button 
                      className="action-btn" 
                      title="Copy Student Link" 
                      onClick={() => {
                        const link = `${window.location.origin}/mock-tests?testId=${test.id}`;
                        navigator.clipboard.writeText(link);
                        alert('Student link copied to clipboard!');
                      }}
                    >🔗</button>
                    
                    {test.status !== 'Published' && (
                      <button className="action-btn" title="Publish" onClick={() => handleStatusChange(test.id, 'Published')}>✅</button>
                    )}
                    {test.status === 'Published' && (
                      <button className="action-btn" title="Unpublish" onClick={() => handleStatusChange(test.id, 'Draft')}>⏸️</button>
                    )}
                    
                    <button className="action-btn" title="Archive" onClick={() => handleStatusChange(test.id, 'Archived')}>📦</button>
                    <button className="action-btn delete" title="Delete" onClick={() => confirmDelete(test.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentTest ? 'Edit Mock Test' : 'Create New Mock Test'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Test Title</label>
                  <input type="text" name="title" className="form-control" required value={formData.title || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Exam Category</label>
                  <input type="text" name="exam" className="form-control" required value={formData.exam || ''} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-control" rows={3} value={formData.description || ''} onChange={handleInputChange}></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Upcoming Test Date (Available From)</label>
                  <input type="date" name="availableFrom" className="form-control" value={formData.availableFrom || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Valid Until (Expiration Date)</label>
                  <input type="date" name="validUntil" className="form-control" value={formData.validUntil || ''} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cover Image (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input type="file" accept="image/*" className="form-control" onChange={(e) => handleImageUpload(e, 'coverImage')} />
                  {formData.coverImage && (
                    <div style={{ position: 'relative' }}>
                      <img src={formData.coverImage} alt="Cover Preview" style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveImage('coverImage')}
                        style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--status-red)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                        title="Remove Image"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Duration (Mins)</label>
                  <input type="number" name="duration" className="form-control" required value={formData.duration || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Marks</label>
                  <input type="number" name="totalMarks" className="form-control" required value={formData.totalMarks || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Question Count</label>
                  <input type="number" name="questionCount" className="form-control" required value={formData.questionCount || ''} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Negative Marking (e.g. 1/3)</label>
                  <input type="text" name="negativeMarking" className="form-control" value={formData.negativeMarking || ''} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Price (0 for Free)</label>
                  <input type="number" name="price" className="form-control" value={formData.price || ''} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">UPI ID (If Paid)</label>
                  <input type="text" name="upiId" className="form-control" value={formData.upiId || ''} onChange={handleInputChange} placeholder="e.g. yourname@upi" />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment QR Code (If Paid)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input type="file" accept="image/*" className="form-control" onChange={(e) => handleImageUpload(e, 'qrCode')} />
                    {formData.qrCode && (
                      <div style={{ position: 'relative' }}>
                        <img src={formData.qrCode} alt="QR Preview" style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveImage('qrCode')}
                          style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--status-red)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                          title="Remove QR Code"
                        >
                          &times;
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Access ID (for students)</label>
                  <input type="text" name="accessId" className="form-control" value={formData.accessId || ''} onChange={handleInputChange} placeholder="e.g. UPSC001" />
                </div>
                <div className="form-group">
                  <label className="form-label">Access Password</label>
                  <input type="text" name="accessPassword" className="form-control" value={formData.accessPassword || ''} onChange={handleInputChange} placeholder="e.g. 12345" />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" className="form-control" value={formData.status || 'Draft'} onChange={handleInputChange}>
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{currentTest ? 'Update Test' : 'Create Test'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--status-red)' }}>Delete Mock Test?</h3>
            <p className="text-muted">Are you sure you want to delete this test? This action cannot be undone.</p>
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
