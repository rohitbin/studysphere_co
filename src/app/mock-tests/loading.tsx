export default function Loading() {
  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <div style={{ height: '32px', width: '200px', backgroundColor: 'var(--border-color)', borderRadius: '6px', marginBottom: '8px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
          <div style={{ height: '20px', width: '150px', backgroundColor: 'var(--border-color)', borderRadius: '6px', animation: 'pulse 1.5s infinite ease-in-out', animationDelay: '0.2s' }}></div>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card" style={{ padding: '1.5rem', opacity: 0.7, animation: 'pulse 1.5s infinite ease-in-out', animationDelay: `${i * 0.15}s` }}>
            <div style={{ height: '200px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '1rem' }}></div>
            <div style={{ height: '24px', width: '80%', backgroundColor: 'var(--border-color)', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
            <div style={{ height: '16px', width: '60%', backgroundColor: 'var(--border-color)', borderRadius: '4px', marginBottom: '1.5rem' }}></div>
            
            <div className="flex justify-between">
              <div style={{ height: '36px', width: '100px', backgroundColor: 'var(--bg-secondary)', borderRadius: '18px' }}></div>
              <div style={{ height: '36px', width: '120px', backgroundColor: 'var(--accent-color)', opacity: 0.5, borderRadius: '8px' }}></div>
            </div>
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }
      `}} />
    </div>
  );
}
