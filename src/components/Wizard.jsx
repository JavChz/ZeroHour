import { useState } from 'react'
import { format } from 'date-fns'

export default function Wizard({ onStart }) {
   const DEFAULT_DAYS = 21;
   const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
   const [title, setTitle] = useState('My Goal')
   const [startD, setStartD] = useState(() => format(new Date(), "yyyy-MM-dd"))
   const [startT, setStartT] = useState(() => format(new Date(), "HH:mm"))
   const [targetMode, setTargetMode] = useState('days') // 'days' or 'date'
   const [targetDays, setTargetDays] = useState(DEFAULT_DAYS)
   const [targetD, setTargetD] = useState(() => {
      const d = new Date()
      d.setDate(d.getDate() + DEFAULT_DAYS)
      return format(d, "yyyy-MM-dd")
   })
   const [targetT, setTargetT] = useState(() => format(new Date(), "HH:mm"))

   const handleSetNow = () => {
      const now = new Date()
      setStartD(format(now, "yyyy-MM-dd"))
      setStartT(format(now, "HH:mm"))
   }

   const handleMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect()
      setMousePos({
         x: e.clientX - rect.left,
         y: e.clientY - rect.top
      })
   }

   const handleSubmit = (e) => {
      e.preventDefault()
      const startDate = `${startD}T${startT}`
      const targetDate = `${targetD}T${targetT}`
      onStart(title, startDate, targetMode, targetMode === 'days' ? targetDays : targetDate)
   }

   return (
      <div className="w-full max-w-lg mx-auto">
         <div 
            className="p-8 backdrop-blur-xl bg-white/40 dark:bg-slate-900/60 border border-white/50 dark:border-slate-700/50 rounded-3xl shadow-2xl relative overflow-hidden group"
            onMouseMove={handleMouseMove}
         >

            {/* Spotlight glow tracking the mouse! */}
            <div 
               className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
               style={{
                  background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(56, 189, 248, 0.12), transparent 40%)`
               }}
            />

            {/* Subtle inner decorative glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="text-center mb-8 relative z-10">
               <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400 mb-4">
                  <span className="material-symbols-outlined text-3xl">timer</span>
               </div>
               <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
                  Create Countdown
               </h1>
               <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                  Configure your goal and share the link with anyone.
               </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
               {/* Title */}
               <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-2">
                     <span className="material-symbols-outlined text-[16px]">label</span> Goal Title
                  </label>
                  <input
                     type="text"
                     required
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                     placeholder="e.g. Vacation to Japan"
                  />
               </div>

               {/* Start Date */}
               <div className="space-y-2">
                  <div className="flex justify-between items-end mb-1">
                     <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">play_circle</span> Origin Date
                     </label>
                     <button
                        type="button"
                        onClick={handleSetNow}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition flex items-center gap-1 cursor-pointer"
                     >
                        <span className="material-symbols-outlined text-[14px]">bolt</span> Set to Now
                     </button>
                  </div>
                  <div className="flex gap-3">
                     <div className="relative w-2/3">
                        <input
                           type="date"
                           required
                           value={startD}
                           onChange={(e) => setStartD(e.target.value)}
                           onClick={(e) => e.target.showPicker && e.target.showPicker()}
                           className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono text-sm text-slate-800 dark:text-slate-100 cursor-pointer"
                        />
                     </div>
                     <div className="relative w-1/3">
                        <input
                           type="time"
                           required
                           value={startT}
                           onChange={(e) => setStartT(e.target.value)}
                           onClick={(e) => e.target.showPicker && e.target.showPicker()}
                           className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono text-sm text-slate-800 dark:text-slate-100 cursor-pointer"
                        />
                     </div>
                  </div>
               </div>

               {/* Target Mode Toggle & Input */}
               <div className="space-y-3">
                  <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl">
                     <button
                        type="button"
                        onClick={() => setTargetMode('days')}
                        className={`flex-1 flex justify-center items-center gap-2 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${targetMode === 'days' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                     >
                        <span className="material-symbols-outlined text-[18px]">calendar_view_week</span> Days
                     </button>
                     <button
                        type="button"
                        onClick={() => setTargetMode('date')}
                        className={`flex-1 flex justify-center items-center gap-2 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${targetMode === 'date' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                     >
                        <span className="material-symbols-outlined text-[18px]">event</span> Specific Date
                     </button>
                  </div>

                  <div className="pt-2">
                     {targetMode === 'days' ? (
                        <div className="relative">
                           <input
                              type="number"
                              required
                              min="1"
                              value={targetDays}
                              onChange={(e) => setTargetDays(Number(e.target.value))}
                              className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-16 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono text-lg text-slate-800 dark:text-slate-100"
                           />
                           <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Days</span>
                        </div>
                     ) : (
                        <div className="flex gap-3">
                           <div className="relative w-2/3">
                              <input
                                 type="date"
                                 required
                                 value={targetD}
                                 onChange={(e) => setTargetD(e.target.value)}
                                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                 className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono text-sm text-slate-800 dark:text-slate-100 cursor-pointer"
                              />
                           </div>
                           <div className="relative w-1/3">
                              <input
                                 type="time"
                                 required
                                 value={targetT}
                                 onChange={(e) => setTargetT(e.target.value)}
                                 onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                 className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono text-sm text-slate-800 dark:text-slate-100 cursor-pointer"
                              />
                           </div>
                        </div>
                     )}
                  </div>
               </div>

               <div className="pt-4">
                  <button
                     type="submit"
                     className="w-full relative overflow-hidden group bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                     <span className="relative z-10 flex items-center gap-2">
                        Generate & Start <span className="material-symbols-outlined">rocket_launch</span>
                     </span>
                     {/* Button hover gradient effect */}
                     <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  </button>
               </div>
            </form>
         </div>
      </div>
   )
}
