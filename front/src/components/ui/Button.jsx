import React from 'react'

export default function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`btn bg-[#86b92f] ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}