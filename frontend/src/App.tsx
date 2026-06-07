import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import { apiGet } from './lib/api'

function App() {
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [pingResponse, setPingResponse] = useState<string>('')
  const [envVars] = useState({
    clerk: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? 'Configured' : 'Missing',
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  })

const checkBackend = async () => {
  setApiStatus('loading')

  try {
    const data = await apiGet('/ping')

    setApiStatus('success')
    setPingResponse(JSON.stringify(data, null, 2))
  } catch (err: any) {
    setApiStatus('error')
    setPingResponse(err.message || 'Failed to connect to backend')
  }
}

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">
          <span className="logo-spark">✦</span>
          <h1>Nimble Portal</h1>
        </div>
        <div className="tech-badges">
          <img src={viteLogo} className="logo vite" alt="Vite logo" />
          <img src={reactLogo} className="logo react" alt="React logo" />
        </div>
      </header>

      <main className="app-content">
        <section className="welcome-card">
          <h2>Welcome to your Nimble Monorepo!</h2>
          <p className="subtitle">
            A high-performance workspace combining a React + Vite frontend and a Fastify backend.
          </p>
          <div className="status-grid">
            <div className="status-tile">
              <h3>Frontend Stack</h3>
              <span className="badge badge-active">React 19 + Vite 8</span>
            </div>
            <div className="status-tile">
              <h3>Clerk Auth</h3>
              <span className={`badge ${envVars.clerk === 'Configured' ? 'badge-active' : 'badge-warning'}`}>
                {envVars.clerk}
              </span>
            </div>
            <div className="status-tile">
              <h3>Backend URI</h3>
              <code className="url-code">{envVars.apiUrl}</code>
            </div>
          </div>
        </section>

        <section className="action-section">
          <div className="card">
            <h3>API Integration Test</h3>
            <p>Verify connectivity to your Node.js + Fastify backend server.</p>
            
            <div className="api-test-box">
              <button 
                onClick={checkBackend} 
                className="btn btn-primary"
                disabled={apiStatus === 'loading'}
              >
                {apiStatus === 'loading' ? 'Pinging backend...' : 'Ping Fastify Backend'}
              </button>

              {apiStatus !== 'idle' && (
                <div className={`api-result result-${apiStatus}`}>
                  <strong>Status:</strong> {apiStatus.toUpperCase()}
                  {pingResponse && <pre className="json-block">{pingResponse}</pre>}
                </div>
              )}
            </div>
          </div>

          <div className="card documentation-links">
            <h3>Resources & Docs</h3>
            <p>Learn more about the components of this monorepo.</p>
            <div className="link-grid">
              <a href="https://vite.dev" target="_blank" rel="noreferrer" className="link-tile">
                <h4>Vite Docs ↗</h4>
                <p>Hot Module Replacement and asset bundling.</p>
              </a>
              <a href="https://react.dev" target="_blank" rel="noreferrer" className="link-tile">
                <h4>React Docs ↗</h4>
                <p>Component structures and state hooks.</p>
              </a>
              <a href="https://fastify.dev" target="_blank" rel="noreferrer" className="link-tile">
                <h4>Fastify Docs ↗</h4>
                <p>Backend routing and middleware.</p>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>Nimble Workspace Setup &bull; Designed with Vanilla CSS</p>
      </footer>
    </div>
  )
}

export default App
