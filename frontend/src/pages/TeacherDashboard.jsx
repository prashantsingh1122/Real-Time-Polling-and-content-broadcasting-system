import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'
import socket from '../services/socket'

const ShellHeader = ({ user, onLogout }) => (
  <header className="border-b border-gray-200 bg-white px-6 py-5">
    <div className="mx-auto flex max-w-6xl items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-xs font-bold text-white">
          BE
        </div>
        <div>
          <h1 className="text-lg font-bold text-black">BroadcastEdu</h1>
          <p className="text-xs text-gray-500">Teacher dashboard</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-gray-600 sm:inline">{user.name}</span>
        <button onClick={onLogout} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
          Logout
        </button>
      </div>
    </div>
  </header>
)

const Field = ({ label, children, wide }) => (
  <div className={wide ? 'md:col-span-2' : ''}>
    <label className="mb-1 block text-sm font-medium text-black">{label}</label>
    {children}
  </div>
)

const inputClass = 'w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-black outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200'
const blackButton = 'rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50'
const ghostButton = 'rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [polls, setPolls] = useState([])
  const [pollLoading, setPollLoading] = useState(false)
  const [creatingPoll, setCreatingPoll] = useState(false)
  const [showPollForm, setShowPollForm] = useState(false)
  const [pollForm, setPollForm] = useState({ question: '', options: ['', ''], end_time: '' })
  const [formData, setFormData] = useState({
    title: '',
    subject: 'maths',
    description: '',
    start_time: '',
    end_time: '',
    rotation_duration: 5
  })
  const [file, setFile] = useState(null)

  useEffect(() => {
    if (!user.id || user.role !== 'teacher') {
      navigate('/login')
      return
    }
    fetchMyContent()
    fetchMyPolls()

    socket.connect()
    socket.emit('join_teacher', user.id)
    socket.on('vote_updated', handleVoteUpdate)
    socket.on('poll_updated', fetchMyPolls)

    return () => {
      socket.off('vote_updated', handleVoteUpdate)
      socket.off('poll_updated', fetchMyPolls)
      socket.disconnect()
    }
  }, [])

  const handleVoteUpdate = (data) => {
    setPolls(current => current.map(poll =>
      poll.id === data.pollId
        ? { ...poll, vote_counts: data.vote_counts, total_votes: data.total_votes }
        : poll
    ))
  }

  const fetchMyContent = async () => {
    setLoading(true)
    try {
      const res = await API.get('/content/my-content')
      setContents(res.data.data.contents)
    } catch (err) {
      setError('Failed to fetch content')
    } finally {
      setLoading(false)
    }
  }

  const fetchMyPolls = async () => {
    setPollLoading(true)
    try {
      const res = await API.get('/polls/my-polls')
      setPolls(res.data.data.polls || [])
    } catch (err) {
      setError('Failed to fetch polls')
    } finally {
      setPollLoading(false)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return setError('Please select a file')
    setUploading(true)
    setError('')
    setSuccess('')

    const data = new FormData()
    data.append('title', formData.title)
    data.append('subject', formData.subject)
    data.append('description', formData.description)
    data.append('start_time', formData.start_time)
    data.append('end_time', formData.end_time)
    data.append('rotation_duration', formData.rotation_duration)
    data.append('file', file)

    try {
      await API.post('/content/upload', data)
      setSuccess('Content uploaded successfully.')
      setShowForm(false)
      setFormData({ title: '', subject: 'maths', description: '', start_time: '', end_time: '', rotation_duration: 5 })
      setFile(null)
      fetchMyContent()
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const updatePollOption = (index, value) => {
    setPollForm(current => ({
      ...current,
      options: current.options.map((option, i) => i === index ? value : option)
    }))
  }

  const addPollOption = () => {
    if (pollForm.options.length < 6) setPollForm(current => ({ ...current, options: [...current.options, ''] }))
  }

  const removePollOption = (index) => {
    if (pollForm.options.length > 2) {
      setPollForm(current => ({ ...current, options: current.options.filter((_, i) => i !== index) }))
    }
  }

  const handleCreatePoll = async (e) => {
    e.preventDefault()
    const options = pollForm.options.map(option => option.trim()).filter(Boolean)
    if (!pollForm.question.trim()) return setError('Poll question is required')
    if (options.length < 2) return setError('At least 2 poll options are required')

    setCreatingPoll(true)
    setError('')
    setSuccess('')

    try {
      await API.post('/polls', { question: pollForm.question.trim(), options, end_time: pollForm.end_time || null })
      setSuccess('Poll created successfully.')
      setPollForm({ question: '', options: ['', ''], end_time: '' })
      setShowPollForm(false)
      fetchMyPolls()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create poll')
    } finally {
      setCreatingPoll(false)
    }
  }

  const togglePoll = async (pollId) => {
    try {
      await API.patch(`/polls/${pollId}/toggle`)
      fetchMyPolls()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update poll')
    }
  }

  const deletePoll = async (pollId) => {
    if (!window.confirm('Delete this poll and its votes?')) return
    try {
      await API.delete(`/polls/${pollId}`)
      setPolls(current => current.filter(poll => poll.id !== pollId))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete poll')
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const statusBadge = (status) => {
    const styles = {
      pending: 'border-amber-200 bg-amber-50 text-amber-700',
      approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      rejected: 'border-red-200 bg-red-50 text-red-700'
    }
    return <span className={`rounded-full border px-2 py-1 text-xs font-medium ${styles[status]}`}>{status}</span>
  }

  return (
    <div className="min-h-screen bg-white text-black" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
      <ShellHeader user={user} onLogout={handleLogout} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="mb-8 flex flex-col gap-4 border-b border-gray-200 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-gray-500">Teacher workspace</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight">Content and live polls</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
              Upload classroom content, create instant polls, and monitor what students are seeing.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowPollForm(!showPollForm)} className={ghostButton}>
              {showPollForm ? 'Close Poll' : 'Create Poll'}
            </button>
            <button onClick={() => setShowForm(!showForm)} className={blackButton}>
              {showForm ? 'Close Upload' : 'Upload Content'}
            </button>
          </div>
        </section>

        {error && <div className="mb-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="mb-5 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

        {showForm && (
          <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-xl font-bold">Upload new content</h3>
            <form onSubmit={handleUpload} className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Title *"><input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required className={inputClass} /></Field>
              <Field label="Subject *">
                <select value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className={inputClass}>
                  <option value="maths">Maths</option>
                  <option value="science">Science</option>
                  <option value="english">English</option>
                  <option value="history">History</option>
                </select>
              </Field>
              <Field label="Description" wide><textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className={inputClass} /></Field>
              <Field label="Start Time"><input type="datetime-local" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} className={inputClass} /></Field>
              <Field label="End Time"><input type="datetime-local" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} className={inputClass} /></Field>
              <Field label="Rotation Duration (mins)"><input type="number" value={formData.rotation_duration} onChange={e => setFormData({ ...formData, rotation_duration: e.target.value })} min={1} className={inputClass} /></Field>
              <Field label="File * (JPG/PNG/GIF)"><input type="file" accept="image/jpeg,image/png,image/gif" onChange={e => setFile(e.target.files[0])} required className={inputClass} /></Field>
              <div className="md:col-span-2">
                <button type="submit" disabled={uploading} className={blackButton}>{uploading ? 'Uploading...' : 'Upload Content'}</button>
              </div>
            </form>
          </section>
        )}

        {showPollForm && (
          <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-xl font-bold">Create new poll</h3>
            <form onSubmit={handleCreatePoll} className="mt-5 space-y-4">
              <Field label="Question *">
                <input type="text" value={pollForm.question} onChange={e => setPollForm({ ...pollForm, question: e.target.value })} required className={inputClass} placeholder="Which topic should we cover next?" />
              </Field>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black">Options *</label>
                {pollForm.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input type="text" value={option} onChange={e => updatePollOption(index, e.target.value)} required={index < 2} className={inputClass} placeholder={`Option ${index + 1}`} />
                    {pollForm.options.length > 2 && <button type="button" onClick={() => removePollOption(index)} className={ghostButton}>Remove</button>}
                  </div>
                ))}
                {pollForm.options.length < 6 && <button type="button" onClick={addPollOption} className="text-sm text-gray-700 hover:text-black">+ Add option</button>}
              </div>
              <Field label="End Time"><input type="datetime-local" value={pollForm.end_time} onChange={e => setPollForm({ ...pollForm, end_time: e.target.value })} className={`${inputClass} md:max-w-sm`} /></Field>
              <button type="submit" disabled={creatingPoll} className={blackButton}>{creatingPoll ? 'Creating...' : 'Create Poll'}</button>
            </form>
          </section>
        )}

        <section className="mb-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-gray-500">Realtime</p>
              <h3 className="mt-2 text-2xl font-bold">Live polls</h3>
            </div>
            <span className="text-sm text-gray-500">{polls.length} total</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {pollLoading ? (
              <div className="p-8 text-center text-gray-500">Loading polls...</div>
            ) : polls.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No polls created yet</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {polls.map(poll => (
                  <div key={poll.id} className="p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <span className={`rounded-full border px-2 py-1 text-xs font-medium ${poll.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                            {poll.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs text-gray-500">{poll.total_votes || 0} votes</span>
                        </div>
                        <h4 className="font-bold">{poll.question}</h4>
                        {poll.end_time && <p className="mt-1 text-xs text-gray-500">Ends {new Date(poll.end_time).toLocaleString()}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => togglePoll(poll.id)} className={ghostButton}>{poll.is_active ? 'Deactivate' : 'Activate'}</button>
                        <button onClick={() => deletePoll(poll.id)} className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700 hover:bg-red-50">Delete</button>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {(poll.vote_counts || []).map((item, index) => {
                        const total = poll.total_votes || 0
                        const percent = total ? Math.round((item.votes / total) * 100) : 0
                        return (
                          <div key={index}>
                            <div className="mb-1 flex justify-between text-xs text-gray-600">
                              <span>{item.option}</span>
                              <span>{item.votes} votes ({percent}%)</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                              <div className="h-full rounded-full bg-black" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-gray-500">Content</p>
              <h3 className="mt-2 text-2xl font-bold">My uploads</h3>
            </div>
            <span className="text-sm text-gray-500">{contents.length} items</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : contents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No content uploaded yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Title</th>
                      <th className="px-4 py-3 font-medium">Subject</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Rejection Reason</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {contents.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-black">{c.title}</td>
                        <td className="px-4 py-3 capitalize text-gray-600">{c.subject}</td>
                        <td className="px-4 py-3">{statusBadge(c.status)}</td>
                        <td className="px-4 py-3 text-xs text-red-600">{c.rejection_reason || '-'}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
