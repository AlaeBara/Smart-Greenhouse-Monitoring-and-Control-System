import React from 'react'

export default function Input({ id, type = 'text', ...props }) {
  return (
    <input
      id={id}
      type={type}
      className="input border-gray-300 bg-white"
      {...props}
    />
  )
}