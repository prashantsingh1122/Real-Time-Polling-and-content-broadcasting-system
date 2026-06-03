import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import socket from '../services/socket'

const buttonBase = 'rounded-lg px-4 py-2 text-sm font-medium transition'
const primaryButton = `${buttonBase} bg-black text-white hover:bg-neutral-800`
const secondaryButton = `${buttonBase} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50`

export default function StudentView() {
  const navigate = useNavigate()
  const [content, setContent] = useState([])
  const [polls, setPolls] = useState([])
  const [votedPolls, setVotedPolls] = useState({})
  const [loadingContent, setLoadingContent] = useState(true)
  const [loadingPolls, setLoadingPolls] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [voteMessage, setVoteMessage] = useState('')
  const [filter, setFilter] = useState('all')

  const getVoterSession = () => {
    const existing = localStorage.getItem('voter_session')
    if (existing) return existing
    const session = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('voter_session', session)
    return session
  }

  const fetchLiveContent = async () => {
    setLoadingContent(true)
    try {
      const res = await axios.get('/api/broadcast/all')
      setContent(res.data.data || [])
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to load live content', err)
    } finally {
      setLoadingContent(false)
    }
  }

  const fetchActivePolls = async () => {
    setLoadingPolls(true)
    try {
      const res = await axios.get('/api/polls/active')
      setPolls(res.data.data || [])
      setVotedPolls(JSON.parse(localStorage.getItem('voted_polls') || '{}'))
    } catch (err) {
      console.error('Failed to load polls', err)
    } finally {
      setLoadingPolls(false)
    }
  }

  const voteOnPoll = async (pollId, optionIndex) => {
    if (votedPolls[pollId] !== undefined) return

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
      window.setTimeout(() => setVoteMessage(''), 3000)
    } catch (err) {
      setVoteMessage(err.response?.data?.error || 'Unable to submit vote')
      window.setTimeout(() => setVoteMessage(''), 3000)
    }
  }

  const applyVoteUpdate = (update) => {
    setPolls(current => current.map(poll =>
      poll.id === update.pollId
        ? { ...poll, vote_counts: update.vote_counts, total_votes: update.total_votes }
        : poll
    ))
  }

  const applyPollUpdate = (update) => {
    if (update.is_active === false) {
      setPolls(current => current.filter(poll => poll.id !== update.pollId))
      return
    }
    fetchActivePolls()
  }

  useEffect(() => {
    fetchLiveContent()
    fetchActivePolls()

    socket.connect()
    socket.emit('join_public')
    socket.on('new_poll', applyPollUpdate)
    socket.on('vote_updated', applyVoteUpdate)
    socket.on('poll_updated', applyPollUpdate)

    const interval = window.setInterval(fetchLiveContent, 5 * 60 * 1000)
    return () => {
      window.clearInterval(interval)
      socket.off('new_poll', applyPollUpdate)
      socket.off('vote_updated', applyVoteUpdate)
      socket.off('poll_updated', applyPollUpdate)
      socket.disconnect()
    }
  }, [])

  const subjects = ['all', 'maths', 'science', 'english', 'history']
  const allCards = content.flatMap(({ teacher, content }) =>
    Object.entries(content).map(([subject, item]) => ({ teacher, subject, ...item }))
  )
  const filteredContent = filter === 'all' ? allCards : allCards.filter(item => item.subject === filter)

  return (
    <div className="min-h-screen bg-white text-black" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-6 py-5 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-xs font-bold text-white">BE</div>
            <div>
              <h1 className="text-lg font-bold text-black">BroadcastEdu</h1>
              <p className="text-xs text-gray-500">Live classroom content</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {lastUpdated && <span className="hidden text-xs text-gray-500 sm:inline">Updated {lastUpdated.toLocaleTimeString()}</span>}
            <button onClick={() => { fetchLiveContent(); fetchActivePolls() }} className={secondaryButton}>Refresh</button>
            <button onClick={() => navigate('/login')} className={primaryButton}>Login</button>
            <button onClick={() => navigate('/')} className="hidden rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 sm:inline">Home</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="mb-8 border-b border-gray-200 pb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-gray-500">Student view</p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight">Today&apos;s live content and active polls</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                Approved content and realtime polls appear here as teachers broadcast them.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-2xl font-bold text-black">{filteredContent.length}</p>
                <p className="mt-1 text-gray-500">Content cards</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-2xl font-bold text-black">{polls.length}</p>
                <p className="mt-1 text-gray-500">Active polls</p>
              </div>
              <div className="hidden rounded-xl border border-gray-200 p-4 sm:block">
                <p className="text-2xl font-bold text-black">Live</p>
                <p className="mt-1 text-gray-500">Socket updates</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-gray-500">Realtime polls</p>
              <h3 className="mt-2 text-2xl font-bold">Vote once and watch results update live</h3>
            </div>
            <button onClick={fetchActivePolls} className={secondaryButton}>Refresh Polls</button>
          </div>

          {voteMessage && (
            <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{voteMessage}</div>
          )}

          {loadingPolls ? (
            <div className="rounded-xl border border-gray-200 p-8 text-center text-gray-500">Loading polls...</div>
          ) : polls.length === 0 ? (
            <div className="rounded-xl border border-gray-200 p-8 text-center">
              <h4 className="text-lg font-bold text-gray-700">No active polls</h4>
              <p className="mt-1 text-sm text-gray-500">Teacher polls will appear here when live.</p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {polls.map(poll => {
                const selected = votedPolls[poll.id]
                const total = poll.total_votes || 0
                return (
                  <div key={poll.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-gray-900">{poll.question}</h4>
                        <p className="mt-1 text-xs text-gray-500">
                          {poll.teacher?.name ? `By ${poll.teacher.name}` : 'Teacher poll'}
                          {poll.end_time ? ` · Ends ${new Date(poll.end_time).toLocaleString()}` : ''}
                        </p>
                      </div>
                      <span className="whitespace-nowrap rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700">{total} votes</span>
                    </div>

                    <div className="space-y-3">
                      {(poll.vote_counts || []).map((item, index) => {
                        const percent = total ? Math.round((item.votes / total) * 100) : 0
                        const hasVoted = selected !== undefined
                        return (
                          <button
                            key={item.option}
                            disabled={hasVoted}
                            onClick={() => voteOnPoll(poll.id, index)}
                            className={`w-full rounded-xl border px-4 py-3 text-left transition ${hasVoted ? 'border-gray-200 bg-gray-100 text-gray-500' : 'border-black bg-white text-black hover:bg-gray-50'}`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span>{item.option}</span>
                              <span className="text-xs text-gray-500">{percent}%</span>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                              <div className="h-full rounded-full bg-black" style={{ width: `${percent}%` }} />
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
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-gray-500">Live content</p>
              <h3 className="mt-2 text-2xl font-bold">Approved classroom broadcasts</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {subjects.map(subject => (
                <button
                  key={subject}
                  onClick={() => setFilter(subject)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${filter === subject ? 'bg-black text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
                >
                  {subject === 'all' ? 'All' : subject.charAt(0).toUpperCase() + subject.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loadingContent ? (
            <div className="rounded-xl border border-gray-200 p-8 text-center text-gray-500">Loading content...</div>
          ) : filteredContent.length === 0 ? (
            <div className="rounded-xl border border-gray-200 p-8 text-center">
              <h4 className="text-lg font-bold text-gray-700">No approved content available</h4>
              <p className="mt-1 text-sm text-gray-500">Try another subject or refresh for updates.</p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {filteredContent.map(item => (
                <div key={`${item.teacher.id}-${item.id}`} className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden transition hover:shadow-md">
                  <img
                    src={item.file_url}
                    alt={item.title}
                    className="h-56 w-full object-cover"
                    onError={e => { e.target.src = 'https://via.placeholder.com/640x360?text=Content' }}
                  />
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.25em] text-gray-500">{item.subject}</p>
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700">{item.teacher?.name || 'Teacher'}</span>
                    </div>
                    <h4 className="mt-4 text-xl font-semibold text-gray-900">{item.title}</h4>
                    {item.description && <p className="mt-3 text-sm leading-6 text-gray-600">{item.description}</p>}
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <p>{new Date(item.created_at).toLocaleDateString()}</p>
                      <a href={item.file_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View file</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
