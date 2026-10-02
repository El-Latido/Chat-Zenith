import React, { useState, useEffect, useRef } from 'react';
import { Github, X, Minus, Maximize2, Minimize2, Folder, FileCode, GitCommit, Save, RefreshCw, Lock, Unlock, Search, History } from 'lucide-react';

interface GitHubAdminPanelProps {
  onClose: () => void;
  currentUser: { username: string; isAdmin?: boolean };
}

interface FileNode {
  path: string;
  type: 'file' | 'dir';
  name: string;
}

interface CommitHistory {
  sha: string;
  message: string;
  date: string;
}

const REPO_OWNER = 'El-Latido';
const REPO_NAME = 'Chat-Zenith8';
const DEFAULT_BRANCH = 'main';
const TOKEN_STORAGE_KEY = 'chatliz_github_token';

export function GitHubAdminPanel({ onClose, currentUser }: GitHubAdminPanelProps) {
  if (!currentUser.isAdmin) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-900 text-white p-4 rounded-lg shadow-xl z-50">
        ⛔ Acceso denegado: Solo administradores.
      </div>
    );
  }

  const [token, setToken] = useState(localStorage.getItem(TOKEN_STORAGE_KEY) || '');
  const [tempToken, setTempToken] = useState('');
  const [isLocked, setIsLocked] = useState(!!localStorage.getItem(TOKEN_STORAGE_KEY));
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBranch, setCurrentBranch] = useState(DEFAULT_BRANCH);
  const [branches, setBranches] = useState<string[]>([]);
  const [commitHistory, setCommitHistory] = useState<CommitHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 900, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // Cargar ramas
  const loadBranches = async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/branches`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setBranches(data.map((b: any) => b.name));
      }
    } catch (e) {}
  };

  // Cargar historial de commits
  const loadCommitHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?sha=${currentBranch}&per_page=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setCommitHistory(data.map((c: any) => ({
          sha: c.sha.substring(0, 7),
          message: c.commit.message,
          date: new Date(c.commit.author.date).toLocaleString(),
        })));
      }
    } catch (e) {}
  };

  // Cargar archivos del repo
  const loadRepoTree = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${currentBranch}?recursive=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Token inválido o error de red');
      const data = await res.json();
      const tree: FileNode[] = data.tree
        .filter((item: any) => item.type === 'blob' || item.type === 'tree')
        .map((item: any) => ({
          path: item.path,
          type: item.type === 'blob' ? 'file' : 'dir',
          name: item.path.split('/').pop() || item.path,
        }));
      setFiles(tree);
      showStatus('success', `📂 ${tree.length} archivos cargados`);
      loadCommitHistory();
    } catch (e: any) {
      showStatus('error', e.message);
    }
    setLoading(false);
  };

  // Cargar contenido de un archivo
  const loadFileContent = async (path: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${currentBranch}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('No se pudo cargar el archivo');
      const data = await res.json();
      const content = atob(data.content.replace(/\n/g, ''));
      setFileContent(content);
      setSelectedFile(path);
    } catch (e: any) {
      showStatus('error', e.message);
    }
    setLoading(false);
  };

  // Commit y push
  const commitAndPush = async () => {
    if (!token || !selectedFile) {
      showStatus('error', 'Selecciona un archivo primero');
      return;
    }
    if (!commitMessage.trim()) {
      showStatus('error', 'Escribe un mensaje de commit');
      return;
    }

    setLoading(true);
    try {
      const fileRes = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${selectedFile}?ref=${currentBranch}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const fileData = await fileRes.json();
      const sha = fileData.sha;

      const updateRes = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${selectedFile}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: commitMessage,
            content: btoa(unescape(encodeURIComponent(fileContent))),
            sha,
            branch: currentBranch,
          }),
        }
      );

      if (!updateRes.ok) {
        const err = await updateRes.json();
        throw new Error(err.message || 'Error al hacer commit');
      }

      showStatus('success', `✅ Commit exitoso: "${commitMessage}"`);
      setCommitMessage('');
      loadCommitHistory();
    } catch (e: any) {
      showStatus('error', e.message);
    }
    setLoading(false);
  };

  const saveToken = () => {
    if (!tempToken.trim()) return;
    localStorage.setItem(TOKEN_STORAGE_KEY, tempToken);
    setToken(tempToken);
    setIsLocked(true);
    showStatus('success', '🔐 Token guardado');
    loadRepoTree();
    loadBranches();
  };

  const clearToken = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken('');
    setTempToken('');
    setIsLocked(false);
    setFiles([]);
    showStatus('info', 'Token eliminado');
  };

  useEffect(() => {
    const match = fileContent.match(/^(\/\/|#|\/\*|<!--)\s*File:\s*(.+?)[\s\n]/i);
    if (match && match[2]) {
      const detectedPath = match[2].trim();
      const exists = files.find(f => f.path === detectedPath);
      if (exists) {
        setSelectedFile(detectedPath);
        showStatus('info', `🧠 Ruta detectada: ${detectedPath}`);
      }
    }
  }, [fileContent, files]);

  const showStatus = (type: 'success' | 'error' | 'info', msg: string) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), 4000);
  };

  const handleDragStart = (e: React.MouseEvent) => {
    if (isResizing) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, e.clientX - dragStart.current.x),
          y: Math.max(0, e.clientY - dragStart.current.y),
        });
      }
      if (isResizing) {
        const newW = Math.max(600, resizeStart.current.w + (e.clientX - resizeStart.current.x));
        const newH = Math.max(400, resizeStart.current.h + (e.clientY - resizeStart.current.y));
        setSize({ width: newW, height: newH });
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeStart.current = { x: e.clientX, y: e.clientY, w: size.width, h: size.height };
  };

  useEffect(() => {
    if (token && files.length === 0) {
      loadRepoTree();
      loadBranches();
    }
  }, [token]);

  const filteredFiles = files.filter(f => 
    f.type === 'file' && f.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filesByDir = filteredFiles.reduce((acc, f) => {
    const dir = f.path.includes('/') ? f.path.substring(0, f.path.lastIndexOf('/')) : '/';
    if (!acc[dir]) acc[dir] = [];
    acc[dir].push(f);
    return acc;
  }, {} as Record<string, FileNode[]>);

  const windowStyle: React.CSSProperties = isMaximized
    ? { top: 0, left: 0, width: '100vw', height: '100vh', borderRadius: 0 }
    : { top: position.y, left: position.x, width: size.width, height: size.height };

  if (isMinimized) {
    return (
      <div
        className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg shadow-2xl cursor-pointer flex items-center gap-2 z-50 hover:scale-105 transition"
        onClick={() => setIsMinimized(false)}
      >
        <Github size={18} />
        <span className="font-bold">GitHub Admin</span>
      </div>
    );
  }

  return (
    <div
      className="fixed bg-gray-900 border-2 border-purple-500 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
      style={windowStyle}
    >
      <div
        className="bg-gradient-to-r from-purple-700 to-pink-600 px-4 py-2 flex items-center justify-between cursor-move select-none"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2 text-white font-bold">
          <Github size={18} />
          <span>GitHub Admin — {REPO_NAME}</span>
          {isLocked && <Lock size={14} className="text-green-300" />}
        </div>
        <div className="flex gap-1">
          <button onClick={() => setIsMinimized(true)} className="p-1 hover:bg-white/20 rounded" title="Minimizar">
            <Minus size={16} />
          </button>
          <button onClick={() => setIsMaximized(!isMaximized)} className="p-1 hover:bg-white/20 rounded" title="Maximizar">
            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button onClick={onClose} className="p-1 hover:bg-red-500 rounded" title="Cerrar">
            <X size={16} />
          </button>
        </div>
      </div>

      {status && (
        <div className={`px-4 py-2 text-sm font-medium ${
          status.type === 'success' ? 'bg-green-900 text-green-200' :
          status.type === 'error' ? 'bg-red-900 text-red-200' :
          'bg-blue-900 text-blue-200'
        }`}>
          {status.msg}
        </div>
      )}

      {!token ? (
        <div className="flex-1 p-6 flex flex-col items-center justify-center gap-4">
          <Lock size={48} className="text-purple-400" />
          <h3 className="text-white text-xl font-bold">Configuración Inicial</h3>
          <p className="text-gray-400 text-center max-w-md">
            Ingresa tu <strong>Personal Access Token</strong> de GitHub con permisos <code>repo</code>.
          </p>
          <input
            type="password"
            value={tempToken}
            onChange={(e) => setTempToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className="w-full max-w-md bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={saveToken}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 cursor-pointer"
          >
            <Save size={16} /> Guardar Token
          </button>
          <a
            href="https://github.com/settings/tokens/new?scopes=repo&description=ChatLiz%20Admin"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 text-sm underline"
          >
            ¿No tienes token? Créalo aquí
          </a>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            <div className="p-2 border-b border-gray-700">
              <div className="relative">
                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar archivos..."
                  className="w-full bg-gray-900 text-white border border-gray-600 rounded pl-8 pr-2 py-1 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <select
                  value={currentBranch}
                  onChange={(e) => setCurrentBranch(e.target.value)}
                  className="flex-1 bg-gray-900 text-white border border-gray-600 rounded px-2 py-1 text-xs"
                >
                  {branches.length > 0 ? (
                    branches.map(b => <option key={b} value={b}>{b}</option>)
                  ) : (
                    <option value={DEFAULT_BRANCH}>{DEFAULT_BRANCH}</option>
                  )}
                </select>
                <button onClick={loadRepoTree} className="p-1 hover:bg-gray-700 rounded cursor-pointer" title="Recargar">
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
                <button onClick={() => setShowHistory(!showHistory)} className="p-1 hover:bg-gray-700 rounded cursor-pointer" title="Historial">
                  <History size={14} />
                </button>
              </div>
            </div>

            {showHistory ? (
              <div className="p-2 space-y-2">
                <div className="text-white text-sm font-bold px-2">Últimos Commits</div>
                {commitHistory.length === 0 ? (
                  <div className="text-xs text-gray-400 px-2">Sin historial o cargando...</div>
                ) : (
                  commitHistory.map(c => (
                    <div key={c.sha} className="text-xs text-gray-300 px-2 py-1 bg-gray-900 rounded">
                      <div className="font-mono text-purple-400">{c.sha}</div>
                      <div className="truncate">{c.message}</div>
                      <div className="text-gray-500">{c.date}</div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {Object.keys(filesByDir).sort().map(dir => (
                  <div key={dir}>
                    <div className="text-gray-400 text-xs font-bold px-2 py-1 flex items-center gap-1">
                      <Folder size={12} /> {dir || '/'}
                    </div>
                    {filesByDir[dir].map(f => (
                      <button
                        key={f.path}
                        onClick={() => loadFileContent(f.path)}
                        className={`w-full text-left px-4 py-1 text-sm rounded flex items-center gap-2 cursor-pointer ${
                          selectedFile === f.path ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <FileCode size={12} />
                        <span className="truncate">{f.name}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center gap-2">
              <input
                type="text"
                value={selectedFile}
                onChange={(e) => setSelectedFile(e.target.value)}
                placeholder="Ruta del archivo"
                className="flex-1 bg-gray-900 text-white border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-purple-500"
              />
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Mensaje de commit..."
                className="flex-1 bg-gray-900 text-white border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={commitAndPush}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-1 rounded font-bold text-sm flex items-center gap-1 cursor-pointer"
              >
                <GitCommit size={14} /> Commit
              </button>
              <button
                onClick={clearToken}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 cursor-pointer"
                title="Borrar token"
              >
                <Unlock size={14} />
              </button>
            </div>

            <textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              placeholder="Pega aquí el código...&#10;&#10;💡 Tip: // File: src/components/PoolTable.tsx"
              className="flex-1 bg-gray-950 text-green-300 font-mono text-sm p-4 resize-none focus:outline-none"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {!isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-purple-500 hover:bg-purple-400"
          onMouseDown={handleResizeStart}
          style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
        />
      )}
    </div>
  );
}
