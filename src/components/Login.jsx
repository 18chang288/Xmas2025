import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function signUp(e) {
    e.preventDefault()
    setMessage('Signing up...')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) setMessage(error.message)
    else setMessage('Signup initiated. Check email (or use provided credentials).')
  }

  async function signIn(e) {
    e.preventDefault()
    setMessage('Signing in...')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    else setMessage('Signed in')
  }

  return (
    <div className="card">
      <h2>Sign in / Sign up</h2>
      <form>
        <label>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <div className="actions">
          <button onClick={signIn}>Sign in</button>
          <button onClick={signUp}>Sign up</button>
        </div>
      </form>
      <p>{message}</p>
    </div>
  )
}
