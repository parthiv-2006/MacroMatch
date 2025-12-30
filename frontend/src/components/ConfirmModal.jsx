import { useState } from 'react'

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', showDontAskAgain = false, dontAskAgainKey = null }) => {
  const [dontAskAgain, setDontAskAgain] = useState(false)

  if (!isOpen) return null

  const handleConfirm = () => {
    if (dontAskAgain && dontAskAgainKey) {
      localStorage.setItem(`dontAsk_${dontAskAgainKey}`, 'true')
    }
    onConfirm()
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity z-0" 
          aria-hidden="true"
          onClick={handleCancel}
        ></div>

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel */}
        <div className="relative z-10 inline-block align-bottom bg-[#0f1c2f] rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-white/10">
          <div className="bg-gradient-to-br from-[#0f1c2f] to-[#0b1524] px-6 pt-6 pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/10 sm:mx-0 sm:h-10 sm:w-10 border border-emerald-500/20">
                <svg className="h-6 w-6 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-semibold text-white" id="modal-title">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-slate-300">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {showDontAskAgain && (
            <div className="px-6 py-3 bg-white/5">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={dontAskAgain}
                  onChange={(e) => setDontAskAgain(e.target.checked)}
                  className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 border-white/20 rounded bg-white/10 cursor-pointer"
                />
                <span className="ml-2 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  Don't ask me again
                </span>
              </label>
            </div>
          )}

          <div className="bg-[#0b1524] px-6 py-4 sm:flex sm:flex-row-reverse gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2.5 bg-linear-to-r from-emerald-500 to-teal-500 text-sm font-medium text-white hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:w-auto transition-all duration-200 hover:scale-[1.02]"
            >
              {confirmText}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="mt-3 w-full inline-flex justify-center rounded-xl border border-white/10 shadow-sm px-4 py-2.5 bg-white/5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 sm:mt-0 sm:w-auto transition-all duration-200"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
