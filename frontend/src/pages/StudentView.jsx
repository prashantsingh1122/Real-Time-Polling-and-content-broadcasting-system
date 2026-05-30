import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import socket from '../services/socket'

export default function StudentView() {
  const { teacherId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [notification, setNotification] = useState('')
  const [viewMode, setViewMode] = useState('live')
  const [allContent, setAllContent] = useState([])
  const [allLoading, setAllLoading] = useState(false)

  const fetchLiveContent = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/broadcast/live/${teacherId}`)
      setData(res.data.data)
      setLastUpdated(new Date())
      setError('')
    } catch (err) {
      setError('Failed to fetch content')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllTeacherContent = async () => {
    setAllLoading(true)
    try {
      const res = await axios.get(`http://localhost:3000/api/broadcast/approved`)
      const teacherContent = res.data.data.filter(c => c.uploaded_by === teacherId)
      setAllContent(teacherContent)
    } catch (err) {
      console.error('Failed to fetch all content')
    } finally {
      setAllLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveContent()
    fetchAllTeacherContent()

    // Connect socket
    socket.connect()
    socket.emit('join_teacher', teacherId)

    // Listen for new approved content
    socket.on('content_approved', (data) => {
      setNotification(`📢 New content available: ${data.content.title}`)
      fetchLiveContent()
      fetchAllTeacherContent()
      setTimeout(() => setNotification(''), 5000)
    })

    // Auto refresh every 5 minutes
    const interval = setInterval(() => {
      fetchLiveContent()
      fetchAllTeacherContent()
    }, 5 * 60 * 1000)

    return () => {
      clearInterval(interval)
      socket.off('content_approved')
      socket.disconnect()
    }
  }, [teacherId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📡</div>
          <p className="text-gray-500">Loading live content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchLiveContent}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const hasContent = data?.content && Object.keys(data.content).length > 0

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Notification Banner */}
      {notification && (
        <div className="bg-green-500 text-white text-center py-2 text-sm font-medium animate-pulse">
          {notification}
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">📡 BroadcastEdu</h1>
            <p className="text-sm text-gray-500">
              Teacher: <span className="font-medium">{data?.teacher}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              ← Back
            </button>
            <p className="text-xs text-gray-400">
              {lastUpdated?.toLocaleTimeString()}
            </p>
            <button
              onClick={() => { fetchLiveContent(); fetchAllTeacherContent() }}
              className="text-xs text-blue-500 hover:text-blue-700"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* View Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('live')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              viewMode === 'live'
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-600 shadow-sm hover:bg-gray-50'
            }`}
          >
            🔴 Live Now
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              viewMode === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 shadow-sm hover:bg-gray-50'
            }`}
          >
            📚 All Content ({allContent.length})
          </button>
        </div>

        {/* LIVE NOW VIEW */}
        {viewMode === 'live' && (
          !hasContent ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Live Content</h2>
              <p className="text-gray-500 text-sm">
                There is no live content from this teacher right now.
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Content will appear here when the teacher schedules it.
              </p>
              <button
                onClick={fetchLiveContent}
                className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                Check Again
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-700">
                📺 Live Content — {new Date().toLocaleDateString()}
              </h2>
              {Object.entries(data.content).map(([subject, content]) => (
                <div key={subject} className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
                    <h3 className="font-semibold capitalize">📚 {subject}</h3>
                    <span className="text-xs bg-blue-500 px-2 py-1 rounded-full">
                      Rotates every {content.rotation_duration} min
                    </span>
                  </div>
                  <div className="p-6 flex gap-6">
                    <div className="flex-shrink-0">
                      <img
                        src={content.file_url}
                        alt={content.title}
                        className="w-48 h-48 object-cover rounded-lg border"
                        onError={e => { e.target.style.display = 'none' }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        {content.title}
                      </h4>
                      {content.description && (
                        <p className="text-gray-600 text-sm mb-3">{content.description}</p>
                      )}
                      <div className="space-y-1 text-xs text-gray-500">
                        <p>📅 Available until: {new Date(content.end_time).toLocaleString()}</p>
                        <p>🔄 Duration: {content.rotation_duration} minutes per slot</p>
                      </div>
                      <a
                        href={content.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-4 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-100"
                      >
                        🔍 View Full Image
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ALL CONTENT VIEW */}
        {viewMode === 'all' && (
          allLoading ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">📡</div>
              <p className="text-gray-500">Loading all content...</p>
            </div>
          ) : allContent.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Content Yet</h2>
              <p className="text-gray-500 text-sm">
                This teacher hasn't published any approved content yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">
                📚 All Approved Content ({allContent.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allContent.map(item => (
                  <div key={item.id} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-md transition">
                    <img
                      src={item.file_url}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                      onError={e => {
                        e.target.src = 'https://via.placeholder.com/400x200?text=Content'
                      }}
                    />
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">{item.title}</h3>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full capitalize ml-2">
                          {item.subject}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-gray-500 text-xs mb-2 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-400">
                          📅 {new Date(item.created_at).toLocaleDateString()}
                        </p>
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-500 hover:underline"
                        >
                          View →
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

      </div>

      {/* Auto refresh notice */}
      <div className="fixed bottom-4 right-4 bg-white shadow rounded-lg px-4 py-2 text-xs text-gray-500">
        🟢 Live — auto-refreshes every 5 min
      </div>
    </div>
  )
}