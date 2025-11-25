import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Wishlist({ user }) {
  const [items, setItems] = useState(['', '', ''])
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data, error } = await supabase.from('wishlists').select('items').eq('user_id', user.id).single()
      if (error) return // no wishlist yet
      if (data && data.items) setItems(data.items.concat([], [], []).slice(0,3))
    }
    load()
  }, [user])

  async function save(e) {
    e.preventDefault()
    setMessage('Saving...')
    const payload = { user_id: user.id, items }
    const { data, error } = await supabase.from('wishlists').upsert(payload)
    if (error) setMessage('Save error: ' + error.message)
    else setMessage('Saved')
  }

  return (
    <div className="card">
      <h2>My Wishlist</h2>
      <form onSubmit={save}>
        <label>Top 3 items</label>
        {items.map((it, idx) => (
          <input key={idx} value={it} onChange={e => { const copy = [...items]; copy[idx] = e.target.value; setItems(copy) }} />
        ))}
        <div className="actions">
          <button type="submit">Save Wishlist</button>
        </div>
      </form>
      <p>{message}</p>
    </div>
  )
}
