import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Login from './components/Login'
import Wishlist from './components/Wishlist'
import Admin from './components/Admin'

export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('home')

  useEffect(() => {
    const session = supabase.auth.getSession().then(r => r.data.session)
    session.then(s => setUser(s?.user ?? null))

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener?.subscription.unsubscribe()
  }, [])

  return (
    <div className="app">
      <header>
        <h1>Secret Santa</h1>
        <nav>
          <button onClick={() => setView('home')}>Home</button>
          {user ? <button onClick={() => setView('wishlist')}>My Wishlist</button> : null}
          {user ? <button onClick={() => setView('admin')}>Admin</button> : null}
        </nav>
      </header>

      <main>
        {!user && <Login />}
        {user && view === 'home' && (
          <div>
            <p>Welcome, {user.email}</p>
            <p>Use the navigation to edit your wishlist or (admin) run pairing.</p>
          </div>
        )}
        {user && view === 'wishlist' && <Wishlist user={user} />}
        {user && view === 'admin' && <Admin />}
      </main>

      <footer>
        <small>Rules: Adults buy gifts. Children only receive. Pairings secret until reveal.</small>
      </footer>
    </div>
  )
}
