import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [count, setCount] = useState({ teachers: 0, content: 0, students: 0 })

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Animate counters
  useEffect(() => {
    const targets = { teachers: 50, content: 200, students: 1000 }
    const duration = 2000
    const steps = 60
    const interval = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
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
    {
      icon: '📤',
      title: 'Smart Content Upload',
      desc: 'Teachers upload images with custom schedules. Set start time, end time, and rotation duration per subject.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '✅',
      title: 'Principal Approval Flow',
      desc: 'Every piece of content goes through a review process. Principal approves or rejects with detailed feedback.',
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: '📡',
      title: 'Live Broadcasting',
      desc: 'Approved content is automatically broadcast to students. Subject-based rotation runs continuously.',
      color: 'from-orange-500 to-rose-500'
    },
    {
      icon: '⚡',
      title: 'Real-Time Updates',
      desc: 'WebSocket technology ensures students see new content the moment it\'s approved. Zero refresh needed.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '🗳️',
      title: 'Live Polling',
      desc: 'Teachers create instant polls. Students vote and watch results update in real time on their screens.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: '🔒',
      title: 'Role-Based Security',
      desc: 'JWT authentication with strict RBAC. Teachers, principals, and students each have defined access.',
      color: 'from-slate-500 to-gray-600'
    }
  ]

  const steps = [
    { role: '👑 Principal', action: 'Sets up the system, manages teachers', color: 'bg-purple-100 border-purple-300 text-purple-800' },
    { role: '👨‍🏫 Teacher', action: 'Uploads content & creates polls with schedules', color: 'bg-blue-100 border-blue-300 text-blue-800' },
    { role: '👑 Principal', action: 'Reviews and approves submitted content', color: 'bg-purple-100 border-purple-300 text-purple-800' },
    { role: '👨‍🎓 Students', action: 'See live content & vote on polls instantly', color: 'bg-green-100 border-green-300 text-green-800' }
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans overflow-x-hidden">

      {/* Custom font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        
        * { font-family: 'DM Sans', sans-serif; }
        h1, h2, h3, .display { font-family: 'Syne', sans-serif; }
        
        .gradient-text {
          background: linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glow {
          box-shadow: 0 0 40px rgba(96, 165, 250, 0.15);
        }
        
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .grid-bg {
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .float { animation: float 3s ease-in-out infinite; }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
      `}</style>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-gray-950/90 backdrop-blur-md border-b border-white/10' : ''
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📡</span>
            <span className="font-bold text-xl" style={{fontFamily: 'Syne, sans-serif'}}>BroadcastEdu</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition hidden md:block">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition hidden md:block">How it works</a>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-sm font-medium transition"
            >
              Login →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center grid-bg pt-20">
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pulse-slow" style={{animationDelay: '1.5s'}} />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-gray-400 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Real-time educational broadcasting platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight" style={{fontFamily: 'Syne, sans-serif'}}>
            Broadcast Knowledge
            <br />
            <span className="gradient-text">In Real Time</span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A modern platform for schools to distribute content, run live polls, 
            and keep students engaged — all without a single physical handout.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-semibold text-lg transition glow"
            >
              Get Started →
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-full font-semibold text-lg transition"
            >
              View Live Content
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: count.teachers + '+', label: 'Teachers' },
              { value: count.content + '+', label: 'Content Items' },
              { value: count.students + '+', label: 'Students' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-black gradient-text" style={{fontFamily: 'Syne, sans-serif'}}>{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
          <span className="text-xs">Scroll to explore</span>
          <div className="w-5 h-8 border border-gray-700 rounded-full flex justify-center pt-1">
            <div className="w-1 h-2 bg-gray-500 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-500 text-sm uppercase tracking-widest mb-4">Who it's for</p>
          <h2 className="text-4xl font-black text-center mb-16" style={{fontFamily: 'Syne, sans-serif'}}>
            Built for Every Role
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                emoji: '👑',
                role: 'Principal',
                color: 'border-purple-500/30 bg-purple-500/5',
                accent: 'text-purple-400',
                perks: [
                  'Review all uploaded content',
                  'Approve or reject with reason',
                  'View real-time analytics',
                  'Manage the entire system'
                ]
              },
              {
                emoji: '👨‍🏫',
                role: 'Teacher',
                color: 'border-blue-500/30 bg-blue-500/5',
                accent: 'text-blue-400',
                perks: [
                  'Upload subject-based content',
                  'Schedule with start & end time',
                  'Create live polls for students',
                  'Track content status'
                ]
              },
              {
                emoji: '👨‍🎓',
                role: 'Student',
                color: 'border-green-500/30 bg-green-500/5',
                accent: 'text-green-400',
                perks: [
                  'No login required',
                  'View live content instantly',
                  'Participate in polls',
                  'See real-time results'
                ]
              }
            ].map((card, i) => (
              <div key={i} className={`border rounded-2xl p-6 card-hover ${card.color}`}>
                <div className="text-4xl mb-4">{card.emoji}</div>
                <h3 className={`text-xl font-bold mb-4 ${card.accent}`} style={{fontFamily: 'Syne, sans-serif'}}>
                  {card.role}
                </h3>
                <ul className="space-y-2">
                  {card.perks.map((perk, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-400">
                      <span className={`text-xs ${card.accent}`}>✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(card.role === 'Student' ? '/dashboard' : '/login')}
                  className={`mt-6 w-full py-2 rounded-xl text-sm font-medium border ${card.color} ${card.accent} hover:opacity-80 transition`}
                >
                  {card.role === 'Student' ? 'View Content →' : `Login as ${card.role} →`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white/2">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-500 text-sm uppercase tracking-widest mb-4">Features</p>
          <h2 className="text-4xl font-black text-center mb-4" style={{fontFamily: 'Syne, sans-serif'}}>
            Everything You Need
          </h2>
          <p className="text-center text-gray-500 mb-16 max-w-xl mx-auto">
            A complete system for modern educational content distribution
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white/3 border border-white/8 rounded-2xl p-6 card-hover cursor-pointer"
                onMouseEnter={() => setActiveFeature(i)}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-white mb-2" style={{fontFamily: 'Syne, sans-serif'}}>{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-500 text-sm uppercase tracking-widest mb-4">Process</p>
          <h2 className="text-4xl font-black text-center mb-16" style={{fontFamily: 'Syne, sans-serif'}}>
            How It Works
          </h2>

          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>
                <div className="flex-1 bg-white/3 border border-white/8 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{step.role}</span>
                    <p className="text-white mt-1">{step.action}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <span className="text-gray-600 text-xl">↓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24 px-6 bg-white/2">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm uppercase tracking-widest mb-4">Technology</p>
          <h2 className="text-4xl font-black mb-12" style={{fontFamily: 'Syne, sans-serif'}}>
            Built With Modern Stack
          </h2>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Node.js', 'Express.js', 'PostgreSQL', 'React.js',
              'Socket.io', 'Redis', 'AWS S3', 'Docker',
              'Nginx', 'GitHub Actions', 'JWT', 'Tailwind CSS'
            ].map((tech, i) => (
              <span
                key={i}
                className="bg-white/5 border border-white/10 text-gray-300 px-4 py-2 rounded-full text-sm font-medium hover:bg-white/10 transition"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-3xl p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-3xl" />
            <div className="relative">
              <div className="text-5xl mb-6 float">📡</div>
              <h2 className="text-4xl font-black mb-4" style={{fontFamily: 'Syne, sans-serif'}}>
                Ready to Broadcast?
              </h2>
              <p className="text-gray-400 mb-8">
                Join the modern way of distributing educational content
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-semibold transition glow"
                >
                  Login to Dashboard →
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-full font-semibold transition"
                >
                  View as Student
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📡</span>
            <span className="font-bold" style={{fontFamily: 'Syne, sans-serif'}}>BroadcastEdu</span>
          </div>
          <p className="text-gray-600 text-sm">
            Built with Node.js, React, WebSockets & AWS
          </p>
          <div className="flex gap-4 text-sm text-gray-600">
            <a href="https://github.com/prashantsingh1122" target="_blank" rel="noreferrer" className="hover:text-white transition">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}