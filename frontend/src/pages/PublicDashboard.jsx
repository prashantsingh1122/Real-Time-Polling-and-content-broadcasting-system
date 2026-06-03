import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import socket from '../services/socket'

const blackButton = 'rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800'
const ghostButton = 'rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'

export default function PublicDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [polls, setPolls] = useState([])
  const [votedPolls, setVotedPolls] = useState({})
  const [loading, setLoading] = useState(true)
  const [pollLoading, setPollLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [voteMessage, setVoteMessage] = useState('')

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

  const getVoterSession = () => {
    const existing = localStorage.getItem('voter_session')
    if (existing) return existing
    const session = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('voter_session', session)
    return session
  }

  const fetchActivePolls = async () => {
    try {
      const res = await axios.get('/api/polls/active')
      setPolls(res.data.data || [])
      setVotedPolls(JSON.parse(localStorage.getItem('voted_polls') || '{}'))
    } catch (err) {
      console.error('Failed to fetch polls')
    } finally {
      setPollLoading(false)
    }
  }

  const voteOnPoll = async (pollId, optionIndex) => {
    setVoteMessage('')
    try {
      const res = await axios.post(`/api/polls/${pollId}/vote`, {
        option_index: optionIndex,
        voter_session: getVoterSession()
      })
      const nextVoted = { ...votedPolls, [pollId]: optionIndex }
      localStorage.setItem('voted_polls', JSON.stringify(nextVoted))
      setVotedPolls(nextVoted)
      setPolls(current => current.map(poll =>
        poll.id === pollId
          ? { ...poll, vote_counts: res.data.data.vote_counts, total_votes: res.data.data.total_votes }
          : poll
      ))
      setVoteMessage('Vote recorded successfully.')
      setTimeout(() => setVoteMessage(''), 3000)
    } catch (err) {
      setVoteMessage(err.response?.data?.error || 'Failed to submit vote')
      setTimeout(() => setVoteMessage(''), 3000)
    }
  }

  const applyVoteUpdate = (update) => {
    setPolls(current => current.map(poll =>
      poll.id === update.pollId
        ? { ...poll, vote_counts: update.vote_counts, total_votes: update.total_votes }
        : poll
    ))
  }

  const addNewPoll = (data) => {
    if (!data?.poll) {
      fetchActivePolls()
      return
    }
    setPolls(current => current.some(poll => poll.id === data.poll.id) ? current : [data.poll, ...current])
    setPollLoading(false)
  }

  const applyPollUpdate = (update) => {
    if (update.is_active === false) {
      setPolls(current => current.filter(poll => poll.id !== update.pollId))
      return
    }
    fetchActivePolls()
  }

  useEffect(() => {
    fetchAllContent()
    fetchActivePolls()

    socket.connect()
    socket.emit('join_public')
    socket.on('new_poll', addNewPoll)
    socket.on('vote_updated', applyVoteUpdate)
    socket.on('poll_updated', applyPollUpdate)

    const interval = setInterval(fetchAllContent, 5 * 60 * 1000)
    return () => {
      clearInterval(interval)
      socket.off('new_poll', addNewPoll)
      socket.off('vote_updated', applyVoteUpdate)
      socket.off('poll_updated', applyPollUpdate)
      socket.disconnect()
    }
  }, [])

  const allCards = (data || []).flatMap(({ teacher, content }) =>
    Object.entries(content).map(([subject, item]) => ({ teacher, subject, ...item }))
  )

  const filtered = filter === 'all' ? allCards : allCards.filter(c => c.subject === filter)

  return (
    <div className="min-h-screen bg-white text-black" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-6 py-5 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-xs font-bold text-white">
              BE
            </div>
            <div>
              <h1 className="text-lg font-bold text-black">BroadcastEdu</h1>
              <p className="text-xs text-gray-500">Live educational content</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && <span className="hidden text-xs text-gray-500 sm:inline">Updated {lastUpdated.toLocaleTimeString()}</span>}
            <button onClick={() => { fetchAllContent(); fetchActivePolls() }} className={ghostButton}>Refresh</button>
            <button onClick={() => navigate('/login')} className={blackButton}>Login</button>
            <button onClick={() => navigate('/')} className="hidden rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 sm:inline">Home</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="mb-8 border-b border-gray-200 pb-8">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-gray-500">Student view</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-4xl font-bold tracking-tight">Today&apos;s live content</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                Approved classroom material and teacher-created polls update here in real time.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-2xl font-bold">{filtered.length}</p>
                <p className="mt-1 text-gray-500">Content</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-2xl font-bold">{polls.length}</p>
                <p className="mt-1 text-gray-500">Polls</p>
              </div>
              <div className="hidden rounded-xl border border-gray-200 p-4 sm:block">
                <p className="text-2xl font-bold">Live</p>
                <p className="mt-1 text-gray-500">Socket updates</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-gray-500">Realtime</p>
              <h3 className="mt-2 text-2xl font-bold">Live polls</h3>
              <p className="mt-1 text-sm text-gray-600">Vote once per poll and watch results update live.</p>
            </div>
            <button onClick={fetchActivePolls} className={ghostButton}>Refresh Polls</button>
          </div>

          {voteMessage && <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{voteMessage}</div>}

          {pollLoading ? (
            <div className="rounded-xl border border-gray-200 p-8 text-center text-gray-500">Loading polls...</div>
          ) : polls.length === 0 ? (
            <div className="rounded-xl border border-gray-200 p-8 text-center">
              <h4 className="text-lg font-bold">No active polls</h4>
              <p className="mt-1 text-sm text-gray-500">Teacher polls will appear here when they are live.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {polls.map(poll => {
                const selected = votedPolls[poll.id]
                const total = poll.total_votes || 0
                return (
                  <div key={poll.id} className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-black">{poll.question}</h4>
                        <p className="mt-1 text-xs text-gray-500">
                          {poll.teacher?.name ? `By ${poll.teacher.name}` : 'Teacher poll'}
                          {poll.end_time ? ` - Ends ${new Date(poll.end_time).toLocaleString()}` : ''}
                        </p>
                      </div>
                      <span className="whitespace-nowrap rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700">{total} votes</span>
                    </div>

                    <div className="space-y-3">
                      {(poll.vote_counts || []).map((item, index) => {
                        const percent = total ? Math.round((item.votes / total) * 100) : 0
                        const hasVoted = selected !== undefined
                        const isSelected = Number(selected) === index
                        return (
                          <button
                            key={index}
                            type="button"
                            disabled={hasVoted}
                            onClick={() => voteOnPoll(poll.id, index)}
                            className={`w-full rounded-lg border p-3 text-left transition ${
                              isSelected ? 'border-black bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50'
                            } ${hasVoted ? 'cursor-default' : ''}`}
                          >
                            <div className="mb-2 flex justify-between text-sm text-gray-800">
                              <span className="font-medium">{item.option}</span>
                              <span>{hasVoted ? `${item.votes} (${percent}%)` : 'Vote'}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                              <div className="h-full rounded-full bg-black" style={{ width: `${hasVoted ? percent : 0}%` }} />
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-gray-500">Broadcast</p>
              <h3 className="mt-2 text-2xl font-bold">Live content</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {subjects.map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition ${
                    filter === s ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-500">Loading live content...</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-gray-200 p-12 text-center">
              <h4 className="text-xl font-bold">No live content</h4>
              <p className="mt-2 text-sm text-gray-500">
                {filter === 'all' ? 'No content is live right now. Check back later.' : `No live ${filter} content right now.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item, index) => (
                <div key={index} className="overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-gray-300">
                  <div className="relative bg-gray-100">
                    <img
                      src={item.file_url}
                      alt={item.title}
                      className="h-48 w-full object-cover"
                      onError={e => {
                        e.target.src = 'https://via.placeholder.com/400x200?text=Content'
                      }}
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-black px-2 py-1 text-xs capitalize text-white">{item.subject}</span>
                    <span className="absolute right-3 top-3 rounded-full border border-white/60 bg-white/90 px-2 py-1 text-xs text-black">Live</span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-black">{item.title}</h4>
                    {item.description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-600">{item.description}</p>}
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-xs text-gray-500">{item.teacher.name}</span>
                      <button onClick={() => navigate(`/live/${item.teacher.id}`)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                        View all
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        BroadcastEdu - content refreshes automatically every 5 minutes
      </footer>
    </div>
  )
}
