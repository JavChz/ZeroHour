import { useState, useEffect } from 'react'

const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + Number(days));
    return result;
};

const calculateTimeDiff = (targetDate, currentDate) => {
    let seconds = Math.floor((targetDate - currentDate) / 1000);
    const isPast = seconds < 0;
    seconds = Math.abs(seconds);

    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    return {
        days: days * (isPast ? -1 : 1),
        hours: hours % 24,
        minutes: minutes % 60,
        seconds: seconds % 60,
        isPast
    };
};

const DisplayUnits = ({ label, value }) => (
   <div className="flex flex-col items-center justify-center p-3 sm:p-5 bg-white/30 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
       <span className="text-3xl sm:text-5xl font-mono font-bold text-slate-800 dark:text-white tabular-nums tracking-tighter">
           {String(Math.abs(value)).padStart(2, '0')}
       </span>
       <span className="text-[10px] sm:text-xs font-semibold text-slate-500 gap-1 tracking-widest uppercase mt-1">
           {label}
       </span>
   </div>
);

export default function TimerView({ params }) {
   const title = params.get('title') || 'Countdown'
   const startStr = params.get('start') || new Date().toISOString()
   const targetType = params.get('targetType') || 'days'
   const targetValue = params.get('targetValue') || '90'

   const [now, setNow] = useState(new Date())
   const [toastMsg, setToastMsg] = useState('')

   useEffect(() => {
      const timer = setInterval(() => setNow(new Date()), 1000)
      return () => clearInterval(timer)
   }, [])

   const dateStart = new Date(startStr)
   let dateFuture = new Date()

   if (targetType === 'days') {
       dateFuture = addDays(dateStart, Number(targetValue))
   } else {
       dateFuture = new Date(targetValue)
   }

   const timeUntilGoal = calculateTimeDiff(dateFuture, now)
   const timeSinceStart = calculateTimeDiff(now, dateStart)
   
   const totalSecondsSinceStart = Math.floor((now - dateStart) / 1000)
   const totalSecondsGoal = Math.floor((dateFuture - dateStart) / 1000)
   
   let percentage = 0
   if (totalSecondsGoal > 0) {
      percentage = (totalSecondsSinceStart / totalSecondsGoal) * 100
   }
   
   const clampedPercentageNum = isNaN(percentage) ? 0 : Math.min(Math.max(percentage, 0), 100)
   const clampedPercentageView = clampedPercentageNum.toFixed(6)

   const dateFormatter = new Intl.DateTimeFormat('en-US', {
       day: '2-digit', month: 'short', year: 'numeric',
       hour: '2-digit', minute: '2-digit'
   })
   
   const untilFormatted = isNaN(dateFuture.getTime()) ? "Invalid Target" : dateFormatter.format(dateFuture)

   const showToast = (msg) => {
       setToastMsg(msg)
       setTimeout(() => setToastMsg(''), 3000)
   }

   const copyToClipboard = () => {
       navigator.clipboard.writeText(window.location.href)
       showToast("Link copied to clipboard!")
   }

   const handleBookmark = () => {
       const isMac = navigator.userAgent.toLowerCase().includes('mac')
       showToast(`Press ${isMac ? 'Cmd' : 'Ctrl'} + D to bookmark this timer`)
   }

   return (
      <div className="w-full mx-auto transform transition duration-500 animate-in fade-in slide-in-from-bottom-4">
         <div className="text-center mb-8 sm:mb-12">
             <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 mb-4 drop-shadow-sm">
                 {title}
             </h1>
             <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-sm text-sm font-medium text-slate-600 dark:text-slate-300">
                    <span className="material-symbols-outlined text-[16px] text-emerald-500">play_circle</span>
                    Origin: {dateFormatter.format(dateStart)}
                 </div>
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-sm text-sm font-medium text-slate-600 dark:text-slate-300">
                    <span className="material-symbols-outlined text-[16px] text-blue-500">flag</span>
                    Target: {untilFormatted}
                 </div>
             </div>
         </div>

         {/* Main Countdown (Until Goal) */}
         <div className="mb-10 sm:mb-14">
             <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-center mb-4 flex items-center justify-center gap-2">
                 <span className="material-symbols-outlined text-[18px]">hourglass_empty</span> Time Until Goal
             </h2>
             <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-3xl mx-auto">
                 <DisplayUnits label="Days" value={timeUntilGoal.days} />
                 <DisplayUnits label="Hours" value={timeUntilGoal.hours} />
                 <DisplayUnits label="Minutes" value={timeUntilGoal.minutes} />
                 <DisplayUnits label="Seconds" value={timeUntilGoal.seconds} />
             </div>
         </div>

         {/* Progress Bar */}
         <div className="max-w-2xl mx-auto mb-10 sm:mb-14">
             <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                 <span>0%</span>
                 <span><span className="text-blue-600 dark:text-cyan-400 font-mono text-sm">{clampedPercentageView}%</span> Completed</span>
                 <span>100%</span>
             </div>
             <div className="w-full h-4 bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner backdrop-blur-sm border border-slate-300/30 dark:border-slate-700/50">
                 <div 
                     className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                     style={{ width: `${clampedPercentageNum}%` }}
                 />
             </div>
         </div>

         {/* Time Since Start & Actions */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto items-center">
             
             <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 border border-white/60 dark:border-slate-700/50 shadow-lg text-center md:text-left flex flex-col justify-center">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 flex items-center justify-center md:justify-start gap-1">
                     <span className="material-symbols-outlined text-[14px]">history</span> Time Since Origin
                 </h3>
                 <div className="font-mono text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                     {timeSinceStart.days}d {timeSinceStart.hours}h {timeSinceStart.minutes}m {timeSinceStart.seconds}s
                 </div>
             </div>

             <div className="flex flex-col sm:flex-row items-center justify-center md:justify-end gap-3">
                 <button 
                     onClick={handleBookmark}
                     className="px-5 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm w-full sm:w-auto cursor-pointer"
                 >
                     Bookmark <span className="material-symbols-outlined text-[20px]">bookmark</span>
                 </button>

                 <button 
                     onClick={copyToClipboard}
                     className="relative overflow-hidden group px-6 py-4 rounded-xl font-bold flex items-center gap-3 transition-all duration-300 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 w-full sm:w-auto justify-center cursor-pointer"
                 >
                     <span className="relative z-10 flex items-center gap-2">
                        Share Link <span className="material-symbols-outlined">share</span>
                     </span>
                     <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                 </button>
             </div>
         </div>

         {toastMsg && (
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 z-[100]">
                <span className="material-symbols-outlined">info</span> {toastMsg}
            </div>
         )}
      </div>
   )
}
