import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

export default function StudentView() {
  const { teacherId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

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

  useEffect(() => {
    fetchLiveContent()

    // Connect socket
    socket.connect()
    socket.emit('join_teacher', teacherId)

    // Listen for new approved content
    socket.on('content_approved', (data) => {
      setNotification(`📢 New content available: ${data.content.title}`)
      fetchLiveContent()
      setTimeout(() => setNotification(''), 5000)
    })
    // Auto refresh every 5 minutes
    const interval = setInterval(fetchLiveContent, 5 * 60 * 1000)
    return () => clearInterval(interval)
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
      {/* Header */}
      <div className="bg-white shadow px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">📡 BroadcastEdu</h1>
            <p className="text-sm text-gray-500">
              Teacher: <span className="font-medium">{data?.teacher}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">
              Last updated: {lastUpdated?.toLocaleTimeString()}
            </p>
            <button
              onClick={fetchLiveContent}
              className="text-xs text-blue-500 hover:text-blue-700 mt-1"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!hasContent ? (
          /* No content available */
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Content Available</h2>
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
          /* Content available */
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-700">
              📺 Live Content — {new Date().toLocaleDateString()}
            </h2>
            {Object.entries(data.content).map(([subject, content]) => (
              <div key={subject} className="bg-white rounded-xl shadow overflow-hidden">
                {/* Subject header */}
                <div className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
                  <h3 className="font-semibold capitalize">📚 {subject}</h3>
                  <span className="text-xs bg-blue-500 px-2 py-1 rounded-full">
                    Rotates every {content.rotation_duration} min
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex gap-6">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={content.file_url}
                        alt={content.title}
                        className="w-48 h-48 object-cover rounded-lg border"
                        onError={e => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>

                    {/* Details */}
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto refresh notice */}
      <div className="fixed bottom-4 right-4 bg-white shadow rounded-lg px-4 py-2 text-xs text-gray-500">
        🔄 Auto-refreshes every 5 minutes
      </div>
    </div>
  )
}