"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface MockTest {
  id: string;
  title: string;
  exam: string;
  questionCount: number;
  status: string;
}

export default function QuestionBankHome() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{ fontSize: '2rem' }}>Question Bank Management</h1>
          <p className="text-muted mt-2">Select a Mock Test to manage its questions.</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {isLoading ? (
           <div className="text-muted">Loading mock tests...</div>
        ) : tests.length === 0 ? (
           <div className="text-muted">No mock tests found. Create a test in Mock Test Management first.</div>
        ) : tests.map(test => (
          <Link key={test.id} href={`/admin/questions/${test.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>{test.id}</span>
                <span className={`badge badge-${test.status}`}>{test.status}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{test.title}</h3>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                 <div><strong>Exam:</strong> {test.exam}</div>
                 <div><strong>Target Qs:</strong> {test.questionCount}</div>
              </div>
              <div style={{ marginTop: '1.5rem', textAlign: 'right', color: 'var(--primary-blue)', fontWeight: 600 }}>
                Manage Questions →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
