import React from 'react';
import { useParams } from 'react-router-dom';

const HifzDebug: React.FC = () => {
  const { courseId } = useParams();
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to br, #0a0f2b, #0e1436, #131b41)',
      color: 'white',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', color: '#22d3ee' }}>
        ✅ Hifz System is Loading!
      </h1>
      <p style={{ fontSize: '18px', marginBottom: '10px', color: '#cbd5e1' }}>
        Course ID: <strong style={{ color: '#38bdf8' }}>{courseId || 'Not specified'}</strong>
      </p>
      <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '30px' }}>
        If you see this page, the routing is working correctly.
      </p>
      
      <div style={{
        background: 'rgba(15, 20, 40, 0.5)',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        borderRadius: '8px',
        padding: '20px',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '15px', color: '#06b6d4' }}>Debug Information:</h2>
        <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '8px 0', borderBottom: '1px solid rgba(100, 116, 139, 0.2)' }}>
            ✓ Route is mounted
          </li>
          <li style={{ padding: '8px 0', borderBottom: '1px solid rgba(100, 116, 139, 0.2)' }}>
            ✓ Component is rendering
          </li>
          <li style={{ padding: '8px 0' }}>
            ✓ JavaScript is executing
          </li>
        </ul>
      </div>
      
      <p style={{ marginTop: '40px', fontSize: '12px', color: '#64748b' }}>
        If you don't see this page, there's a routing or rendering issue.
      </p>
    </div>
  );
};

export default HifzDebug;
