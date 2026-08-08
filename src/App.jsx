import { useEffect, useMemo, useRef, useState } from 'react'

const MANDATORY_TASKS = [
  'Surgey/OBG - 1 Hrs',
  'Pathology - 15mins',
  'Pharmacology - 30mins',
  'Anatomy/Micro 30mins',
  'PYQs - 200 per day / 2 Hrs',
  'Complied Modules',
  'Medicine - 1 Hrs',
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
const END_DATE = new Date('2026-08-29T00:00:00+05:30')

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

function addDaysToDateKey(dateKey, count) {
  const date = parseDateKey(dateKey)
  date.setDate(date.getDate() + count)
  return getDateKeyInIst(date)
}

function getCalendarDays(selectedDateKey) {
  const start = parseDateKey('04-08-2026')
  const end = parseDateKey('29-08-2026')
  const selected = parseDateKey(selectedDateKey)

  const days = []
  const current = new Date(start)

  while (current <= end) {
    days.push(getDateKeyInIst(current))
    current.setDate(current.getDate() + 1)
  }

  return days.map((dateKey) => ({
    dateKey,
    isPast: parseDateKey(dateKey) < selected,
    isSelected: dateKey === selectedDateKey,
  }))
}

function getDayLabel(dateKey) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
  }).format(parseDateKey(dateKey))
}

function getDayNumber(dateKey) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
  }).format(parseDateKey(dateKey))
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
  const [liveDateKey, setLiveDateKey] = useState(() => getDateKeyInIst())
  const [selectedDateKey, setSelectedDateKey] = useState(() => getDateKeyInIst())
  const [checklist, setChecklist] = useState(() => createChecklist())
  const [dailyTopicDone, setDailyTopicDone] = useState(false)
  const liveDateKeyRef = useRef(getDateKeyInIst())

  useEffect(() => {
    const refreshDate = () => {
      const newDateKey = getDateKeyInIst()
      setLiveDateKey(newDateKey)
      setSelectedDateKey((prevSelectedDate) =>
        prevSelectedDate === liveDateKeyRef.current ? newDateKey : prevSelectedDate,
      )
      liveDateKeyRef.current = newDateKey
    }

    refreshDate()
    const timer = window.setInterval(refreshDate, 60000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storageKey = `neet-prep-ladder-${selectedDateKey}`
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
  }, [selectedDateKey])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storageKey = `neet-prep-ladder-daily-topic-${selectedDateKey}`
    const savedState = window.localStorage.getItem(storageKey)
    setDailyTopicDone(savedState === 'true')
  }, [selectedDateKey])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storageKey = `neet-prep-ladder-${selectedDateKey}`
    window.localStorage.setItem(storageKey, JSON.stringify(checklist))
  }, [checklist, selectedDateKey])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storageKey = `neet-prep-ladder-daily-topic-${selectedDateKey}`
    window.localStorage.setItem(storageKey, JSON.stringify(dailyTopicDone))
  }, [dailyTopicDone, selectedDateKey])

  const dailyTopic = useMemo(() => getDailyTopic(selectedDateKey), [selectedDateKey])
  const completedCount = checklist.filter((item) => item.done).length
  const dayStrip = useMemo(() => getCalendarDays(selectedDateKey), [selectedDateKey])

  const toggleTask = (id) => {
    setChecklist((currentChecklist) =>
      currentChecklist.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/95">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Prep Ladder</p>
              <h1 className="text-2xl font-bold text-white">Simple Study Dashboard</h1>
            </div>
            <div className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/80">
              Live IST: {liveDateKey}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {dayStrip.map(({ dateKey, isPast, isSelected }) => {
              const day = getDayLabel(dateKey)
              const number = getDayNumber(dateKey)

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDateKey(dateKey)}
                  className={`min-w-[62px] rounded-xl border px-2 py-2 text-center transition ${
                    isSelected
                      ? 'border-white bg-white text-black'
                      : isPast
                        ? 'border-white/10 bg-white/5 text-white/40'
                        : 'border-white/15 bg-black text-white hover:border-white/40'
                  }`}
                >
                  <div className="text-[9px] uppercase tracking-[0.22em]">{day}</div>
                  <div className="mt-1 text-base font-bold">{number}</div>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-white/5">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Selected Date</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{selectedDateKey}</h2>
            <p className="mt-1 text-sm text-white/70">{getDayLabel(selectedDateKey)}</p>
            <p className="mt-4 text-sm text-white/75">
              The mandatory items stay the same every day, but the topic and checklist state now follow the date you pick in the top bar.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Today’s Main Topic</p>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="checkbox"
                checked={dailyTopicDone}
                onChange={() => setDailyTopicDone((prev) => !prev)}
                className="h-4 w-4 accent-white"
                aria-label="Mark daily topic as complete"
              />
              <div className={dailyTopicDone ? 'text-2xl font-bold text-white/50 line-through' : 'text-2xl font-bold text-white'}>
                {dailyTopic}
              </div>
            </div>
            <p className="mt-3 text-sm text-white/75">Change the selected date in the top bar to update the topic and checklist instantly.</p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Mandatory Things</p>
              <h3 className="text-xl font-bold text-white">To-do ladder</h3>
            </div>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
              {completedCount}/{checklist.length} done
            </span>
          </div>

          <div className="space-y-3">
            {checklist.map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/70 p-4 transition hover:border-white/30"
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleTask(item.id)}
                  className="mt-1 h-4 w-4 accent-white"
                />
                <span className={item.done ? 'text-white/40 line-through' : 'text-white'}>
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
