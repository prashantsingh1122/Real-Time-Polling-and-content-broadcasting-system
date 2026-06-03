import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import socket from '../services/socket'
import API from '../services/api'

const blackButton = 'rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50'
const ghostButton = 'rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'

export default function PrincipalDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState('all')
  const [rejectModal, setRejectModal] = useState({ open: false, id: null })
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    if (!user.id || user.role !== 'principal') {
      navigate('/login')
      return
    }
    fetchContent()

    socket.connect()
    socket.emit('join_principal')
    socket.on('new_content_uploaded', fetchContent)

    return () => {
      socket.off('new_content_uploaded')
      socket.disconnect()
    }
  }, [])

  const fetchContent = async () => {
    setLoading(true)
    try {
      const res = await API.get('/approval/all')
      setContents(res.data.contents)
    } catch (err) {
      setError('Failed to fetch content')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    setError('')
    setSuccess('')
    try {
      await API.patch(`/approval/${id}/approve`)
      setSuccess('Content approved.')
      fetchContent()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve')
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return setError('Rejection reason is required')
    setError('')
    try {
      await API.patch(`/approval/${rejectModal.id}/reject`, { reason: rejectReason })
      setSuccess('Content rejected.')
      setRejectModal({ open: false, id: null })
      setRejectReason('')
      fetchContent()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject')
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const filteredContents = contents.filter(c => filter === 'all' || c.status === filter)
  const pendingCount = contents.filter(c => c.status === 'pending').length
  const approvedCount = contents.filter(c => c.status === 'approved').length
  const rejectedCount = contents.filter(c => c.status === 'rejected').length

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
      <header className="border-b border-gray-200 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-xs font-bold text-white">
              BE
            </div>
            <div>
              <h1 className="text-lg font-bold text-black">BroadcastEdu</h1>
              <p className="text-xs text-gray-500">Principal dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-600 sm:inline">{user.name}</span>
            <button onClick={handleLogout} className={ghostButton}>Logout</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="mb-8 border-b border-gray-200 pb-8">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-gray-500">Review workspace</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-4xl font-bold tracking-tight">Content approval</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                Review teacher uploads, approve live material, or send a clear rejection reason.
              </p>
            </div>
            <button onClick={fetchContent} className={blackButton}>Refresh</button>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          {[
            ['Total Content', contents.length],
            ['Pending Review', pendingCount],
            ['Approved', approvedCount],
            ['Rejected', rejectedCount]
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-3xl font-bold text-black">{value}</p>
              <p className="mt-2 text-sm text-gray-600">{label}</p>
            </div>
          ))}
        </section>

        {error && <div className="mb-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="mb-5 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

        <section>
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-gray-500">Queue</p>
              <h3 className="mt-2 text-2xl font-bold">Teacher uploads</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'approved', 'rejected'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition ${
                    filter === f
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {f}
                  {f === 'pending' && pendingCount > 0 && <span className="ml-2 rounded-full bg-red-600 px-1.5 py-0.5 text-xs text-white">{pendingCount}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : filteredContents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No content found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Title</th>
                      <th className="px-4 py-3 font-medium">Subject</th>
                      <th className="px-4 py-3 font-medium">File</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredContents.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-black">
                          {c.title}
                          {c.rejection_reason && <p className="mt-1 text-xs text-red-600">Reason: {c.rejection_reason}</p>}
                        </td>
                        <td className="px-4 py-3 capitalize text-gray-600">{c.subject}</td>
                        <td className="px-4 py-3">
                          <a href={c.file_url} target="_blank" rel="noreferrer" className="text-gray-700 underline-offset-4 hover:underline">
                            View File
                          </a>
                        </td>
                        <td className="px-4 py-3">{statusBadge(c.status)}</td>
                        <td className="px-4 py-3">
                          {c.status === 'pending' ? (
                            <div className="flex gap-2">
                              <button onClick={() => handleApprove(c.id)} className="rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800">
                                Approve
                              </button>
                              <button onClick={() => setRejectModal({ open: true, id: c.id })} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No action</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-xl font-bold text-black">Reject content</h3>
            <p className="mt-2 text-sm text-gray-600">Give the teacher a short reason so they can fix the upload.</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Enter rejection reason..."
              className="mt-4 w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setRejectModal({ open: false, id: null })} className={ghostButton}>Cancel</button>
              <button onClick={handleReject} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
