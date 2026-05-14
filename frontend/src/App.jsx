import { useState, useEffect } from 'react'
import axios from 'axios'
import './index.css' // Ważne: używamy pliku z Twoimi stylami

function App() {
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Upewnij się, że backend działa pod tym adresem (127.0.0.1 lub localhost)
        const profileRes = await axios.get('http://127.0.0.1:8000/api/profile')
        const projectsRes = await axios.get('http://127.0.0.1:8000/api/projects')
        
        setProfile(profileRes.data)
        
        // Bezpieczne przypisanie: jeśli projects jest wewnątrz obiektu, weź go, 
        // a jeśli plik to bezpośrednio lista, weź całość.
        const projectsData = projectsRes.data.projects || projectsRes.data
        setProjects(Array.isArray(projectsData) ? projectsData : [])
        
      } catch (err) {
        console.error("API Error:", err)
        setError("Could not connect to the backend. Is FastAPI running?")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Widok ładowania
  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
        <code>Loading Portfolio Data...</code>
      </div>
    )
  }

  // Widok błędu (zamiast pustego ekranu)
  if (error || !profile) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '100px', color: '#ff4b4b' }}>
        <h2>error_connection_failed</h2>
        <code>{error || "Profile data is missing"}</code>
        <p style={{ marginTop: '20px', color: 'var(--text)' }}>
          Check if FastAPI is running at http://127.0.0.1:8000
        </p>
      </div>
    )
  }

  return (
    <div className="container">
      <header style={{ marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '10px' }}>
          {profile.first_name} {profile.last_name}
        </h1>
        <p style={{ fontSize: '1.5rem', color: 'var(--accent)', fontWeight: 'bold' }}>
          {profile.title}
        </p>
        <p style={{ marginTop: '30px', maxWidth: '800px', lineHeight: '1.6' }}>
          {profile.about_me}
        </p>
      </header>

      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Skills</h2>
        <div className="skills-container" style={{ justifyContent: 'flex-start' }}>
          {profile.skills.languages.map(lang => (
            <span key={lang} className="skill-tag">{lang}</span>
          ))}
          {profile.skills.frameworks_libraries.map(lib => (
            <span key={lib} className="skill-tag">{lib}</span>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Projects</h2>
        <div className="projects-grid">
          {projects.length > 0 ? (
            projects.map(project => (
              <div key={project.id} className="project-card">
                <h3>{project.title}</h3>
                <p style={{ fontSize: '0.95rem', marginBottom: '20px' }}>{project.description}</p>
                <div className="project-tech">
                  {Array.isArray(project.technologies) ? project.technologies.join(' / ') : ''}
                </div>
                <a href={project.github_url} target="_blank" rel="noreferrer" className="github-link">
                  View Source →
                </a>
              </div>
            ))
          ) : (
            <p>No projects found in projects.json</p>
          )}
        </div>
      </section>

      <footer style={{ marginTop: '100px', padding: '40px 0', borderTop: '1px solid var(--border)', color: 'var(--text)' }}>
        <code>{profile.contact.location} — {profile.contact.email}</code>
      </footer>
    </div>
  )
}

export default App