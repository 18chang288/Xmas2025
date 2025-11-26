import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import LandingPage from './LandingPage'
import Wishlist from './components/Wishlist'
import Admin from './components/Admin'

export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('home')

  // Listen to Supabase auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogin = async (username, password) => {
    const email = `${username}@example.com`
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    setUser(data.user)
  }

  const handleSignup = async (username, password) => {
    const email = `${username}@example.com`
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) throw error
    setUser(data.user)
  }

  if (!user) {
    return <LandingPage onLogin={handleLogin} onSignup={handleSignup} />
  }

  return (
    <div className="app">
      <header>
        <h1>Secret Santa</h1>
        <nav>
          <button onClick={() => setView('home')}>Home</button>
          <button onClick={() => setView('wishlist')}>My Wishlist</button>
          <button onClick={() => setView('admin')}>Admin</button>
        </nav>
      </header>

      <main>
        {view === 'home' && <p>Welcome, {user.email.split('@')[0]}</p>}
        {view === 'wishlist' && <Wishlist user={user} />}
        {view === 'admin' && <Admin />}
      </main>
    </div>
  )
}
