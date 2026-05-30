import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import socket from '../services/socket'
import API from '../services/api'

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

  // Connect socket
  socket.connect()
  socket.emit('join_principal') // join principal room

  // When new content is uploaded by any teacher → refresh list
  socket.on('new_content_uploaded', () => {
    fetchContent() // auto refresh pending list
  })

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
      setSuccess('Content approved!')
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
      setSuccess('Content rejected!')
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

  const filteredContents = contents.filter(c => {
    if (filter === 'all') return true
    return c.status === filter
  })

  const statusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    )
  }

  const pendingCount = contents.filter(c => c.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">📡 BroadcastEdu</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">👑 {user.name}</span>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-gray-800">{contents.length}</p>
            <p className="text-sm text-gray-500 mt-1">Total Content</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-yellow-500">{pendingCount}</p>
            <p className="text-sm text-gray-500 mt-1">Pending Review</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-green-500">
              {contents.filter(c => c.status === 'approved').length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Approved</p>
          </div>
        </div>

        {/* Alerts */}
        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f} {f === 'pending' && pendingCount > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
            </button>
          ))}
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredContents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No content found</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Subject</th>
                  <th className="px-4 py-3 text-left">File</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredContents.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {c.title}
                      {c.rejection_reason && (
                        <p className="text-xs text-red-500 mt-1">Reason: {c.rejection_reason}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600">{c.subject}</td>
                    <td className="px-4 py-3">
                      <a
                        href={c.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View File
                      </a>
                    </td>
                    <td className="px-4 py-3">{statusBadge(c.status)}</td>
                    <td className="px-4 py-3">
                      {c.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(c.id)}
                            className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectModal({ open: true, id: c.id })}
                            className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Reject Content</h3>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Enter rejection reason..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRejectModal({ open: false, id: null })}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}