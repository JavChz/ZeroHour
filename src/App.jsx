import { useState, useEffect } from 'react'
import Wizard from './components/Wizard'
import TimerView from './components/TimerView'
import ThemeToggle from './components/ThemeToggle'

function App() {
  const [params, setParams] = useState(() => new URLSearchParams(window.location.search))
  
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
       return localStorage.getItem('theme') || 
         (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    }
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
       root.classList.add('dark')
    } else {
       root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const handlePopState = () => {
      setParams(new URLSearchParams(window.location.search))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const startTimer = (title, startDate, targetGoalType, targetGoalValue) => {
    const newParams = new URLSearchParams()
    newParams.set('title', title)
    newParams.set('start', startDate)
    newParams.set('targetType', targetGoalType) // 'days' or 'date'
    newParams.set('targetValue', targetGoalValue)
    
    // Update URL without reload
    const newUrl = `${window.location.pathname}?${newParams.toString()}`
    window.history.pushState({}, '', newUrl)
    setParams(newParams)
  }

  const editTimer = () => {
    window.history.pushState({}, '', window.location.pathname)
    setParams(new URLSearchParams(window.location.search))
  }

  const hasTimerParams = params.has('title') && params.has('start') && params.has('targetType') && params.has('targetValue')

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 sm:p-8 transition-colors duration-300">
      
      {/* Background gradients for premium feel */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-400/20 dark:bg-cyan-500/10 blur-3xl"></div>
      </div>

      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
         {hasTimerParams && (
           <button 
             onClick={editTimer} 
             className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-sm font-medium text-sm"
           >
              <span className="material-symbols-outlined text-[18px]">edit</span> 
              <span>New</span>
           </button>
         )}
         <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>

      <div className="w-full max-w-4xl z-10 w-full h-full flex flex-col justify-center">
        {hasTimerParams ? (
          <TimerView params={params} />
        ) : (
          <Wizard onStart={startTimer} />
        )}
      </div>
    </div>
  )
}

export default App
