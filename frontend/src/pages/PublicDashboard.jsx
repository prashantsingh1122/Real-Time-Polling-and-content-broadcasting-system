import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function PublicDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [lastUpdated, setLastUpdated] = useState(null)

  const subjects = ['all', 'maths', 'science', 'english', 'history']

  const fetchAllContent = async () => {
    try {
      const res = await axios.get('/api/broadcast/all')
      setData(res.data.data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllContent()
    const interval = setInterval(fetchAllContent, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Flatten all content for filtering
  const allCards = (data || []).flatMap(({ teacher, content }) =>
    Object.entries(content).map(([subject, item]) => ({
      teacher,
      subject,
      ...item
    }))
  )

  const filtered = filter === 'all'
    ? allCards
    : allCards.filter(c => c.subject === filter)

  return (
    <div className="min-h-screen bg-red-700">
      {/* Navbar */}
      <nav className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">📡 BroadcastEdu</h1>
            <p className="text-xs text-gray-400">Live Educational Content</p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-gray-400 hidden sm:block">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchAllContent}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              🔄
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-blue-600 text-white py-12 px-4 text-center">
        <h2 className="text-3xl font-bold mb-2">📚 Today's Live Content</h2>
        <p className="text-blue-100 text-sm">
          Approved content from your teachers — updated in real time
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Subject Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition ${
                filter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {s === 'all' ? '🌐 All' :
               s === 'maths' ? '🔢 Maths' :
               s === 'science' ? '🔬 Science' :
               s === 'english' ? '📖 English' :
               '🏛️ History'}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📡</div>
            <p className="text-gray-500">Loading live content...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Live Content</h3>
            <p className="text-gray-400 text-sm">
              {filter === 'all'
                ? 'No content is live right now. Check back later!'
                : `No live ${filter} content right now.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden"
              >
                {/* Image */}
                <div className="relative">
                  <img
                    src={item.file_url}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                    onError={e => {
                      e.target.src = 'https://via.placeholder.com/400x200?text=Content'
                    }}
                  />
                  <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full capitalize">
                    {item.subject}
                  </span>
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    🔴 Live
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-gray-500 text-xs mb-2 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-400">
                      👨‍🏫 {item.teacher.name}
                    </span>
                    <button
                      onClick={() => navigate(`/live/${item.teacher.id}`)}
                      className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100"
                    >
                      View All →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400 mt-8">
        📡 BroadcastEdu — Content auto-refreshes every 5 minutes
      </footer>
    </div>
  )
}