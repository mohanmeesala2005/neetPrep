import { useEffect, useMemo, useState } from 'react'

const MANDATORY_TASKS = [
  'Surgey/OBG - 1.5 Hrs',
  'Pathology - 15mins',
  'Pharmacology - 30mins',
  'Anatomy/Micro 30mins',
  'PYQs - 200 per day / 2 Hrs',
]

const DAILY_TOPICS = [
    'Ophthalmology, Radiology',
    'FM, GT',
    'Orthopedics, ENT,Test',
    'Biochemistry',
    'GT',
    'Microbiology',
    'Anatomy',
    'Pediatrics',
    'Test',
    'OBG',
    'OBG',
    'Sx',
    'Sx',
    'PSM',
    'PSM',
    'Mock',
]

const START_DATE = new Date('2026-08-04T00:00:00+05:30')

function formatDateInIst(date = new Date()) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function getDateKeyInIst(date = new Date()) {
  const parts = formatDateInIst(date).split('/')
  return `${parts[0]}-${parts[1]}-${parts[2]}`
}

function parseDateKey(dateKey) {
  const [day, month, year] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function getDailyTopic(dateKey) {
  const today = parseDateKey(dateKey)
  const dayDiff = Math.floor((today - START_DATE) / (1000 * 60 * 60 * 24))
  const boundedIndex = Math.max(0, Math.min(dayDiff, DAILY_TOPICS.length - 1))
  return DAILY_TOPICS[boundedIndex]
}

function createChecklist() {
  return MANDATORY_TASKS.map((task, index) => ({
    id: `${index}-${task}`,
    text: task,
    done: false,
  }))
}

function App() {
  const [currentDateKey, setCurrentDateKey] = useState(() => getDateKeyInIst())
  const [checklist, setChecklist] = useState(() => createChecklist())

  useEffect(() => {
    const refreshDate = () => setCurrentDateKey(getDateKeyInIst())

    refreshDate()
    const timer = window.setInterval(refreshDate, 60000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storageKey = `neet-prep-ladder-${currentDateKey}`
    const savedState = window.localStorage.getItem(storageKey)

    if (savedState) {
      const parsed = JSON.parse(savedState)
      setChecklist(
        MANDATORY_TASKS.map((task, index) => ({
          id: `${index}-${task}`,
          text: task,
          done: parsed[index]?.done ?? false,
        })),
      )
    } else {
      setChecklist(createChecklist())
    }
  }, [currentDateKey])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storageKey = `neet-prep-ladder-${currentDateKey}`
    window.localStorage.setItem(storageKey, JSON.stringify(checklist))
  }, [checklist, currentDateKey])

  const dailyTopic = useMemo(() => getDailyTopic(currentDateKey), [currentDateKey])
  const completedCount = checklist.filter((item) => item.done).length

  const toggleTask = (id) => {
    setChecklist((currentChecklist) =>
      currentChecklist.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-emerald-50">
      <header className="border-b border-emerald-500/20 bg-slate-950/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Prep Ladder</p>
            <h1 className="text-2xl font-bold text-white">Simple Study Dashboard</h1>
          </div>
          <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1 text-sm text-emerald-100">
             {currentDateKey}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-emerald-500/25 bg-slate-900/75 p-6 shadow-xl shadow-emerald-950/20">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Daily Topic</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{dailyTopic}</h2>
            <p className="mt-3 text-sm text-slate-300">
              The mandatory items stay the same every day. When the IST date changes, the checklist resets automatically for the new day.
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-500/25 bg-slate-900/75 p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Progress</p>
            <div className="mt-2 text-4xl font-bold text-white">{completedCount}/{checklist.length}</div>
            <p className="mt-2 text-sm text-slate-300">Finish the checklist items to keep your day on track.</p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-emerald-500/20 bg-slate-900/75 p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Mandatory Things</p>
              <h3 className="text-xl font-bold text-white">To-do ladder for today</h3>
            </div>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100">
              Constant list • daily reset
            </span>
          </div>

          <div className="space-y-3">
            {checklist.map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-emerald-500/20 bg-slate-950/60 p-4 transition hover:border-emerald-300/60"
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleTask(item.id)}
                  className="mt-1 h-4 w-4 accent-emerald-400"
                />
                <span className={item.done ? 'text-slate-400 line-through' : 'text-slate-100'}>
                  {item.text}
                </span>
              </label>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
