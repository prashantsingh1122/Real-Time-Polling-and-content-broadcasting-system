import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'

const Icon = ({ name, className = 'h-4 w-4' }) => {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true'
  }

  const paths = {
    back: (
      <>
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m3 3 18 18" />
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
        <path d="M9.9 4.2A10.4 10.4 0 0 1 12 4c6.5 0 10 8 10 8a18.5 18.5 0 0 1-3.2 4.5" />
        <path d="M6.6 6.6A18 18 0 0 0 2 12s3.5 8 10 8a10.5 10.5 0 0 0 4.2-.9" />
      </>
    ),
    radio: (
      <>
        <path d="M4.9 19.1a10 10 0 1 1 14.2 0" />
        <path d="M8.5 15.5a5 5 0 1 1 7 0" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="M8 17V9" />
        <path d="M13 17V5" />
        <path d="M18 17v-3" />
      </>
    ),
    zap: <path d="M13 2 3 14h8l-1 8 11-14h-8l0-6Z" />
  }

  return <svg {...common}>{paths[name]}</svg>
}

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await API.post('/auth/login', formData)
      const { token, user } = res.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      if (user.role === 'principal') navigate('/principal')
      else if (user.role === 'teacher') navigate('/teacher')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fillLogin = (email) => {
    setFormData({ email, password: 'password123' })
    setError('')
  }

  return (
    <div className="min-h-screen bg-white text-black" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="fixed left-5 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-200"
        aria-label="Return to landing page"
        title="Return to landing page"
      >
        <Icon name="back" />
      </button>

      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="hidden flex-col justify-between border-r border-gray-200 px-11 py-12 lg:flex">
          <div className="flex items-center gap-3">
            <div className="ml-1 flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
              <Icon name="radio" className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-black">BroadcastEdu</h1>
              <p className="text-xs text-gray-600">Content Broadcasting System</p>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-gray-600">
              Real-time classroom control
            </p>
            <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-black">
              Manage content and live polls from one clean dashboard.
            </h2>
            <p className="mt-7 max-w-lg leading-7 text-gray-700">
              Teachers can publish polls instantly, principals can review content, and students see live updates without refreshing.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <Icon name="zap" className="mb-8 h-5 w-5 text-gray-100" />
              <p className="text-lg font-bold text-black">Live</p>
              <p className="mt-2 text-sm text-gray-600">WebSocket updates</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <Icon name="users" className="mb-8 h-5 w-5 text-gray-100" />
              <p className="text-lg font-bold text-black">RBAC</p>
              <p className="mt-2 text-sm text-gray-600">Role dashboards</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <Icon name="chart" className="mb-8 h-5 w-5 text-gray-100" />
              <p className="text-lg font-bold text-black">Polls</p>
              <p className="mt-2 text-sm text-gray-600">Instant voting</p>
            </div>
          </div>
        </section>

        <main className="flex items-center justify-center px-6 py-12 bg-white">
          <div className="w-full max-w-sm lg:mt-4">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                <Icon name="radio" className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-black">BroadcastEdu</h1>
                <p className="text-xs text-gray-600">Content Broadcasting System</p>
              </div>
            </div>

            <div className="mb-9">
              <h2 className="text-2xl font-bold tracking-tight text-black">Welcome back</h2>
              <p className="mt-3 text-sm text-gray-700">
                Sign in to continue to your dashboard.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-red-300 bg-red-100/60 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-black">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-transparent bg-gray-200 px-4 py-3 text-sm text-black outline-none transition-all placeholder:text-gray-500 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                  placeholder="you@school.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-black">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-transparent bg-gray-200 px-4 py-3 pr-11 text-sm text-black outline-none transition-all placeholder:text-gray-500 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-black"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon name={showPassword ? 'eyeOff' : 'eye'} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full rounded-lg bg-neutral-900 py-3 text-sm font-bold text-white transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-gray-200 pt-7">
              <p className="mb-5 text-center text-xs font-medium uppercase tracking-wider text-gray-600">
                Demo accounts
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fillLogin('principal@school.com')}
                  className="group flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 transition-all hover:border-gray-300 hover:bg-gray-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full text-gray-100 transition-colors group-hover:text-gray-400">
                    <Icon name="users" />
                  </span>
                  <span className="text-sm font-medium text-black">Principal</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillLogin('john@school.com')}
                  className="group flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 transition-all hover:border-gray-300 hover:bg-gray-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full text-gray-100 transition-colors group-hover:text-gray-400">
                    <Icon name="radio" />
                  </span>
                  <span className="text-sm font-medium text-black">Teacher</span>
                </button>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-gray-600">
              Don't have an account?{' '}
              <button type="button" className="text-gray-300 underline-offset-4 hover:text-gray-600 hover:underline">
                Contact admin
              </button>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
