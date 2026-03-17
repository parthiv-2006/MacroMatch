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
    <div className="fixed inset-0 z-50 overflow-y-auto font-inter" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity z-0" 
          aria-hidden="true"
          onClick={handleCancel}
        ></div>

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel */}
        <div className="relative z-10 inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-soft-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-100 ring-1 ring-slate-200/50">
          <div className="px-6 pt-6 pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-50 sm:mx-0 sm:h-10 sm:w-10 border border-emerald-100 shadow-sm">
                <svg className="h-6 w-6 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="mt-4 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-bold text-slate-900" id="modal-title">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {showDontAskAgain && (
            <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={dontAskAgain}
                  onChange={(e) => setDontAskAgain(e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 border-slate-300 rounded shadow-sm cursor-pointer"
                />
                <span className="ml-2 pl-1 text-sm font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">
                  Don't ask me again
                </span>
              </label>
            </div>
          )}

          <div className="bg-slate-50 px-6 py-4 sm:flex sm:flex-row-reverse gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full inline-flex justify-center rounded-xl shadow-sm px-5 py-2.5 bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:w-auto transition-all duration-200 active:scale-[0.98]"
            >
              {confirmText}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-200 shadow-sm px-5 py-2.5 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 sm:mt-0 sm:w-auto transition-all duration-200 active:scale-[0.98]"
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
