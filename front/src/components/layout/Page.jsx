import React from 'react'
import springBg from '../../assets/springBg.png'

export default function Page({ children }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 relative overflow-hidden">
      <main className="min-h-screen mx-auto px-6 flex items-center justify-center">
        {/* Container for page content */}
        <section className="w-full max-w-md">
          {children}
        </section>
      </main>
      <footer className="absolute -bottom-5 left-0 right-0 ">
        <img
          src={springBg}
          className='h-[100px] w-full'
        />
      </footer>
    </div>
  )
}