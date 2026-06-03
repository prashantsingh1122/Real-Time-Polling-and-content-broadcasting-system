import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [count, setCount] = useState({ teachers: 0, content: 0, students: 0 })

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const targets = { teachers: 50, content: 200, students: 1000 }
    const duration = 1600
    const steps = 50
    const interval = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step += 1
      const progress = step / steps
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount({
        teachers: Math.floor(eased * targets.teachers),
        content: Math.floor(eased * targets.content),
        students: Math.floor(eased * targets.students)
      })
      if (step >= steps) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [])

  const features = [
    ['Smart Uploads', 'Teachers upload scheduled classroom content by subject.'],
    ['Approval Flow', 'Principals review, approve, or reject uploads with feedback.'],
    ['Live Broadcast', 'Students see approved content update on public displays.'],
    ['Instant Polling', 'Teachers create polls and students vote in real time.'],
    ['Role Security', 'Dashboards stay separated for teachers and principals.'],
    ['Socket Updates', 'New content, approvals, and votes arrive without refresh.']
  ]

  const roles = [
    ['Principal', 'Review uploads and keep published content clean.'],
    ['Teacher', 'Upload lessons, schedule content, and create live polls.'],
    ['Student', 'View live content and vote without logging in.']
  ]

  const steps = [
    ['Teacher uploads', 'Content is scheduled with subject, time window, and duration.'],
    ['Principal reviews', 'Approved content becomes available for broadcast.'],
    ['Students view', 'Live dashboard shows current content and active polls.'],
    ['Results update', 'Votes and content changes appear instantly.']
  ]

  return (
    <div className="min-h-screen bg-white text-black" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
      <nav className={`fixed left-0 right-0 top-0 z-50 border-b transition ${
        scrolled ? 'border-gray-200 bg-white/95 backdrop-blur' : 'border-transparent bg-white/80'
      }`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-xs font-bold text-white">
              BE
            </div>
            <div>
              <h1 className="text-lg font-bold">BroadcastEdu</h1>
              <p className="text-xs text-gray-500">Content Broadcasting System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="#features" className="hidden rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 md:inline">Features</a>
            <a href="#process" className="hidden rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 md:inline">Process</a>
            <button onClick={() => navigate('/dashboard')} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Student View
            </button>
            <button onClick={() => navigate('/login')} className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
              Login
            </button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden border-b border-gray-200 px-6 pt-32">
        <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
        <div className="absolute bottom-10 left-8 h-56 w-56 rounded-full bg-emerald-100 blur-3xl" />

        <div className="relative mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl gap-12 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-gray-500">
              Real-time educational broadcasting
            </p>
            <h2 className="mt-5 max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              Broadcast knowledge from one clean dashboard.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600">
              A focused system for schools to upload content, approve broadcasts, run live polls, and keep students connected without refreshing.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => navigate('/login')} className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800">
                Login to Dashboard
              </button>
              <button onClick={() => navigate('/dashboard')} className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                View Live Content
              </button>
            </div>

            <div className="mt-12 grid max-w-xl grid-cols-3 gap-4">
              {[
                [count.teachers + '+', 'Teachers'],
                [count.content + '+', 'Content Items'],
                [count.students + '+', 'Students']
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-3xl font-bold">{value}</p>
                  <p className="mt-1 text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-black p-5 text-white">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Live board</p>
                  <h3 className="mt-2 text-2xl font-bold">Today&apos;s Broadcast</h3>
                </div>
                <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs text-black">Live</span>
              </div>
              <div className="mt-5 space-y-3">
                {['Science lab safety', 'History timeline', 'Maths quick poll'].map((item, index) => (
                  <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{item}</p>
                      <span className="text-xs text-gray-400">{index === 2 ? 'Poll' : 'Content'}</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-white" style={{ width: `${70 - index * 16}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-xs font-medium uppercase tracking-[0.35em] text-gray-500">Who it serves</p>
          <h2 className="mt-3 text-center text-4xl font-bold">Built for every role</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {roles.map(([role, desc]) => (
              <div key={role} className="rounded-xl border border-gray-200 bg-white p-6 transition hover:border-gray-300">
                <p className="text-xl font-bold">{role}</p>
                <p className="mt-3 text-sm leading-6 text-gray-600">{desc}</p>
                <button onClick={() => navigate(role === 'Student' ? '/dashboard' : '/login')} className="mt-6 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  {role === 'Student' ? 'Open student view' : `Login as ${role}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-gray-200 bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-gray-500">Features</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="text-4xl font-bold">Everything the broadcast flow needs</h2>
            <p className="max-w-md text-sm leading-6 text-gray-600">
              Simple tools for uploading, reviewing, publishing, voting, and monitoring live classroom content.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map(([title, desc], index) => (
              <div key={title} className="rounded-xl border border-gray-200 bg-white p-6">
                <div className={`mb-5 h-2 w-16 rounded-full ${
                  index % 3 === 0 ? 'bg-blue-500' : index % 3 === 1 ? 'bg-emerald-500' : 'bg-violet-500'
                }`} />
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs font-medium uppercase tracking-[0.35em] text-gray-500">Process</p>
          <h2 className="mt-3 text-center text-4xl font-bold">How it works</h2>
          <div className="mt-10 space-y-3">
            {steps.map(([title, desc], index) => (
              <div key={title} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-black p-10 text-center text-white">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-gray-400">Ready</p>
          <h2 className="mt-3 text-4xl font-bold">Start broadcasting smarter</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-300">
            Open the dashboard for staff workflows or jump into the live student view.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={() => navigate('/login')} className="rounded-lg bg-white px-6 py-3 text-sm font-medium text-black hover:bg-gray-100">
              Login to Dashboard
            </button>
            <button onClick={() => navigate('/dashboard')} className="rounded-lg border border-white/20 px-6 py-3 text-sm font-medium text-white hover:bg-white/10">
              View as Student
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-gray-500 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-[10px] font-bold text-white">BE</div>
            <span className="font-bold text-black">BroadcastEdu</span>
          </div>
          <p>Built with Node.js, React, WebSockets and AWS</p>
          <a href="https://github.com/prashantsingh1122" target="_blank" rel="noreferrer" className="hover:text-black">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
