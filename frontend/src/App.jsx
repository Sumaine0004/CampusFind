import { useEffect, useState } from 'react'
import './App.css'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api/items').replace(/\/$/, '')
const EMPTY_FORM = {
  itemName: '',
  description: '',
  category: '',
  location: '',
  contact: '',
  status: 'Lost',
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`)
  }
  return data
}

function App() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function loadItems() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(API_URL)
      setItems(await readResponse(response))
    } catch (requestError) {
      setError(`${requestError.message}. Make sure the backend is running on port 5001.`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const response = await fetch(editingId ? `${API_URL}/${editingId}` : API_URL, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      await readResponse(response)
      setMessage(editingId ? 'Item updated.' : 'Item added.')
      resetForm()
      await loadItems()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  function startEditing(item) {
    setEditingId(item._id)
    setForm({
      itemName: item.itemName || '',
      description: item.description || '',
      category: item.category || '',
      location: item.location || '',
      contact: item.contact || '',
      status: item.status || 'Lost',
    })
    setMessage('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteItem(item) {
    if (!window.confirm(`Delete “${item.itemName}”?`)) return
    setMessage('')
    setError('')
    try {
      const response = await fetch(`${API_URL}/${item._id}`, { method: 'DELETE' })
      await readResponse(response)
      setMessage('Item deleted.')
      if (editingId === item._id) resetForm()
      await loadItems()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <main className="campusfind">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="CampusFind home">
          <span className="brand-mark">C</span> CampusFind
        </a>
        <span className="topbar-note">A little help finding what’s lost</span>
      </header>

      <section className="intro" id="top">
        <p className="eyebrow">CAMPUS LOST &amp; FOUND</p>
        <h1>Lost something? <span>Found something?</span></h1>
        <p className="intro-copy">Share a report with the campus community and help belongings find their way home.</p>
      </section>

      <div className="content-grid">
        <section className="form-card" aria-labelledby="form-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">REPORT AN ITEM</p>
              <h2 id="form-heading">{editingId ? 'Update your report' : 'Add an item'}</h2>
            </div>
            <span className="step-badge">01</span>
          </div>

          {message && <p className="notice success" role="status">{message}</p>}
          {error && <p className="notice error" role="alert">{error}</p>}

          <form onSubmit={handleSubmit}>
            <label>Item name<input name="itemName" value={form.itemName} onChange={handleChange} placeholder="e.g. Blue water bottle" required /></label>
            <label>Description<textarea name="description" value={form.description} onChange={handleChange} placeholder="Add details that can help identify it" rows="3" required /></label>
            <div className="field-row">
              <label>Category<input name="category" value={form.category} onChange={handleChange} placeholder="e.g. Electronics" required /></label>
              <label>Status<select name="status" value={form.status} onChange={handleChange}><option>Lost</option><option>Found</option><option>Claimed</option><option>Returned</option></select></label>
            </div>
            <label>Where was it lost or found?<input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Main library" required /></label>
            <label>Contact information<input name="contact" value={form.contact} onChange={handleChange} placeholder="Email or phone number" required /></label>
            <div className="form-actions">
              <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Post item'}</button>
              {editingId && <button className="secondary-button" type="button" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
          <p className="privacy-note">Only share contact details you’re comfortable showing to other students.</p>
        </section>

        <section className="items-section" aria-labelledby="items-heading">
          <div className="section-heading items-title-row">
            <div>
              <p className="eyebrow">CAMPUS BOARD</p>
              <h2 id="items-heading">Recent reports <span className="item-count">{items.length}</span></h2>
            </div>
            <button className="refresh-button" type="button" onClick={loadItems} disabled={loading}>↻ Refresh</button>
          </div>

          {loading ? <p className="empty-state">Loading reports…</p> : items.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">✳</span><h3>No reports yet</h3><p>When someone posts a lost or found item, it will appear here.</p></div>
          ) : (
            <div className="item-list">
              {items.map((item) => (
                <article className="item-card" key={item._id}>
                  <div className="item-card-top">
                    <span className={`status-pill status-${(item.status || 'lost').toLowerCase()}`}>{item.status || 'Lost'}</span>
                    <span className="item-category">{item.category}</span>
                  </div>
                  <h3>{item.itemName}</h3>
                  <p className="item-description">{item.description}</p>
                  <div className="item-meta"><span>⌖ {item.location}</span><span>✉ {item.contact}</span></div>
                  <div className="item-actions">
                    <button className="text-button" type="button" onClick={() => startEditing(item)}>Edit</button>
                    <button className="text-button delete-button" type="button" onClick={() => deleteItem(item)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
      <footer className="footer">CampusFind <span>·</span> Helping campus belongings find their way home</footer>
    </main>
  )
}

export default App
