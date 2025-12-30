import React from 'react'

const ValidationError = ({ message, show = false }) => {
  if (!show) return null
  
  return (
    <div className="flex items-center gap-2 mt-1.5 p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-xs font-medium text-red-300">{message}</span>
    </div>
  )
}

export default ValidationError
