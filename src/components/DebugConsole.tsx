import React, { useState, useEffect } from 'react';

export function DebugConsole() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleLog = (type: string, args: any[]) => {
      const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ');
      setLogs(prev => [...prev.slice(-15), `[${type.toUpperCase()}] ${message}`]);
    };

    const originalConsoleError = console.error;
    const originalConsoleLog = console.log;

    console.error = (...args) => {
      handleLog('error', args);
      originalConsoleError(...args);
    };

    console.log = (...args) => {
      handleLog('log', args);
      originalConsoleLog(...args);
    };

    const handleWindowError = (event: ErrorEvent) => {
      setLogs(prev => [...prev.slice(-15), `[WINDOW ERROR] ${event.message} at ${event.filename}:${event.lineno}`]);
    };

    window.addEventListener('error', handleWindowError);

    return () => {
      console.error = originalConsoleError;
      console.log = originalConsoleLog;
      window.removeEventListener('error', handleWindowError);
    };
  }, []);

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        style={{ position: 'fixed', top: 5, right: 5, zIndex: 99999, background: 'red', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px' }}
      >
        Mostrar Errores
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      maxHeight: '150px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: '#00ff66',
      fontFamily: 'monospace',
      fontSize: '11px',
      padding: '8px',
      zIndex: 99999,
      overflowY: 'auto',
      borderBottom: '2px solid red'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', borderBottom: '1px solid #444', paddingBottom: '2px' }}>
        <strong style={{ color: '#ff3333' }}>🛠️ Consola de Diagnóstico (Chat-Liz)</strong>
        <button 
          onClick={() => setIsVisible(false)}
          style={{ background: '#333', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '10px' }}
        >
          Ocultar
        </button>
      </div>
      {logs.length === 0 ? (
        <div>No hay errores registrados todavía. Si la pantalla está en negro, revisa la carga de imágenes o assets.</div>
      ) : (
        logs.map((log, index) => (
          <div key={index} style={{ color: log.includes('ERROR') ? '#ff6b6b' : '#00ff66', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {log}
          </div>
        ))
      )}
    </div>
  );
}
