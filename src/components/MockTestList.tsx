"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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
  accessId?: string;
  accessPassword?: string;
  coverImage?: string;
  upiId?: string;
  qrCode?: string;
  validUntil?: string;
  availableFrom?: string;
}

export default function MockTestList({ tests }: { tests: MockTest[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTest, setSelectedTest] = useState<MockTest | null>(null);

  useEffect(() => {
    const testId = searchParams.get('testId');
    if (testId) {
      const test = tests.find(t => t.id === testId);
      if (test) {
        setSelectedTest(test);
      }
    }
  }, [searchParams, tests]);
  
  // Access state
  const [accessId, setAccessId] = useState("");
  const [accessPassword, setAccessPassword] = useState("");
  const [accessError, setAccessError] = useState("");

  const handleOpenModal = (test: MockTest) => {
    setSelectedTest(test);
    setAccessError("");
    setAccessId("");
    setAccessPassword("");
  };

  const handleCloseModal = () => {
    setSelectedTest(null);
  };

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTest) return;

    // Check against dynamically set credentials from the Admin panel
    if (
      accessId === selectedTest.accessId && 
      accessPassword === selectedTest.accessPassword
    ) {
      router.push(`/mock-tests/${selectedTest?.id}/exam`);
      handleCloseModal();
    } else {
      setAccessError("Invalid ID or password. Please try again.");
    }
  };

  if (tests.length === 0) {
    return (
      <div className="card text-center" style={{ padding: '4rem 2rem' }}>
        <h3 className="text-muted">No mock tests available right now.</h3>
        <p className="text-muted mt-2">Please check back later once the administrator publishes new tests.</p>
      </div>
    );
  }

  return (
    <>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {tests.map((test, index) => (
          <div key={test.id} className="card flex-col" style={{ display: 'flex', overflow: 'hidden' }}>
            {test.coverImage && (
              <img src={test.coverImage} alt={test.title} style={{ width: 'calc(100% + 3rem)', height: 'auto', display: 'block', margin: '-1.5rem -1.5rem 1.5rem -1.5rem' }} />
            )}
            <div className="flex justify-between items-start" style={{ marginBottom: '0.75rem' }}>
              <span className="text-muted" style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Mock Test {String(index + 1).padStart(2, '0')}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                {test.validUntil && (
                  <span 
                    className="badge-valid-pulse"
                    style={{ 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    ⏳ Valid until {test.validUntil.split('-').reverse().join('/')}
                  </span>
                )}
                {test.availableFrom && new Date(test.availableFrom) > new Date() ? (
                  <span 
                    className="badge-upcoming-pulse"
                    style={{
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    📅 Upcoming {test.availableFrom.split('-').reverse().join('/')}
                  </span>
                ) : (
                  <span 
                    style={{ 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      color: 'var(--status-green)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Available
                  </span>
                )}
              </div>
            </div>
            
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', lineHeight: '1.2' }}>{test.title}</h3>
            <span style={{ 
              display: 'inline-block',
              backgroundColor: 'var(--accent-gray)', 
              padding: '2px 8px', 
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '0.75rem',
              alignSelf: 'flex-start'
            }}>
              {test.exam}
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div><strong>Questions:</strong> {test.questionCount}</div>
              <div><strong>Marks:</strong> {test.totalMarks}</div>
              <div><strong>Duration:</strong> {test.duration} Min</div>
              <div><strong>Neg. Mark:</strong> {test.negativeMarking}</div>
              <div><strong>Price:</strong> {test.price === 0 ? 'Free' : `₹${test.price}`}</div>
            </div>

            <div style={{ marginTop: 'auto' }}>
              {test.availableFrom && new Date(test.availableFrom) > new Date() ? (
                <button 
                  className="btn btn-outline" 
                  style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#f8f9fa', padding: '0.6rem' }}
                  disabled
                >
                  OPENS {test.availableFrom.split('-').reverse().join('/')}
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '0.6rem' }}
                  onClick={() => handleOpenModal(test)}
                >
                  START MOCK TEST
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Access Modal */}
      {selectedTest && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', padding: '0' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--accent-gray)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Get Access to Mock Test</h2>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem' }}>
              {selectedTest.coverImage && (
                <div style={{ width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <img src={selectedTest.coverImage} alt={selectedTest.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              )}
              
              {/* Section A: Payment Access */}
              {selectedTest.price > 0 && (
                <div style={{ border: '1px solid var(--primary-blue)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', backgroundColor: 'rgba(26, 115, 232, 0.05)' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary-blue)' }}>Purchase to access the Mock Test</h3>
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ width: '220px', height: '220px', backgroundColor: 'white', border: '1px solid var(--accent-gray)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', overflow: 'hidden', flexShrink: 0 }}>
                       {selectedTest.qrCode ? (
                         <img src={selectedTest.qrCode} alt="UPI QR Code" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                       ) : (
                         <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=${selectedTest.upiId || 'studysphere_co@upi'}&pn=StudySphere_co&am=${selectedTest.price}`} alt="UPI QR Code" style={{ width: '100%' }} />
                       )}
                    </div>
                    <div style={{ flex: '1 1 250px' }}>
                      <p style={{ fontWeight: 600, fontSize: '1.25rem', marginBottom: '0.25rem' }}>Amount: ₹{selectedTest.price}</p>
                      <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>UPI ID: {selectedTest.upiId || 'Not provided'}</p>
                      <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Scan the QR code and complete the payment. After payment, send your screenshot on WhatsApp to get access.</p>
                      <a 
                        href={`https://wa.me/919415590278?text=Hello StudySphere_co, I have completed the payment of ₹${selectedTest.price} for Mock Test: ${selectedTest.title}. Please activate my access.`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-primary" 
                        style={{ backgroundColor: '#25D366', width: '100%' }}
                      >
                        Message on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Section B: ID/Password Access */}
              <div style={{ border: '1px solid var(--accent-gray)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{selectedTest.title} — ALREADY HAVE ACCESS?</h3>
                {accessError && (
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-red)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    {accessError}
                  </div>
                )}
                <form onSubmit={handleAccessSubmit}>
                  <div className="form-group">
                    <label className="form-label">Mock Test Access ID</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. UPSC001" 
                      required 
                      value={accessId}
                      onChange={(e) => setAccessId(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="••••••••" 
                      required 
                      value={accessPassword}
                      onChange={(e) => setAccessPassword(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-outline" style={{ width: '100%' }}>
                    Unlock Mock Test
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
