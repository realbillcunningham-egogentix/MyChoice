import { useState } from 'react'

function App() {
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    setResponse('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Say hello and introduce yourself in one sentence.' })
      })
      const data = await res.json()
      setResponse(data.response || data.error)
    } catch (err) {
      setResponse('Error: ' + err.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">OpinionGen MVP</h1>
      <button
        onClick={handleClick}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg text-lg font-semibold"
      >
        {loading ? 'Thinking...' : 'Ask Claude'}
      </button>
      {response && (
        <div className="mt-8 max-w-xl bg-gray-800 p-6 rounded-lg">
          <p>{response}</p>
        </div>
      )}
    </div>
  )
}
