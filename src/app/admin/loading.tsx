export default function Loading() {
  return (
    <div className="container py-10 flex justify-center items-center h-full min-h-[50vh]">
      <div className="flex flex-col items-center">
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid var(--border-color)', 
          borderTopColor: 'var(--accent-color)', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
        <p className="mt-4 text-muted">Loading...</p>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
