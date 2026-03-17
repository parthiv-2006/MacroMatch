import { useState } from 'react'

const PromptModal = ({ isOpen, onClose, onSubmit, title, message, placeholder = '', defaultValue = '', inputType = 'text' }) => {
  const [value, setValue] = useState(defaultValue)

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (value.trim()) {
      onSubmit(value)
      onClose()
    }
  }

  const handleCancel = () => {
    setValue(defaultValue)
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
          <form onSubmit={handleSubmit}>
            <div className="px-6 pt-6 pb-6 border-b border-slate-100">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-50 sm:mx-0 sm:h-10 sm:w-10 border border-emerald-100 shadow-sm">
                  <svg className="h-6 w-6 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="mt-4 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                  <h3 className="text-lg leading-6 font-bold text-slate-900" id="modal-title">
                    {title}
                  </h3>
                  {message && (
                    <div className="mt-2 text-sm text-slate-500 font-medium">
                      <p>{message}</p>
                    </div>
                  )}
                  <div className="mt-5">
                    <input
                      type={inputType}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={placeholder}
                      autoFocus
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 sm:text-sm transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 sm:flex sm:flex-row-reverse gap-3">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-xl shadow-sm px-5 py-2.5 bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:w-auto transition-all duration-200 active:scale-[0.98]"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-200 shadow-sm px-5 py-2.5 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 sm:mt-0 sm:w-auto transition-all duration-200 active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PromptModal
