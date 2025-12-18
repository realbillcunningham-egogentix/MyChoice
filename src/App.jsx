import { useState } from 'react'

const personas = {
  bill: {
    name: "Bill Cunningham",
    context: `You are simulating Bill Cunningham's opinions and communication style.

Bill is a Development Team Leader at Rebar Systems, managing Agile transformation for the ROME platform. He co-leads the RCM/ROME Support Enhancement Program.

Key traits:
- Strong project management and technical leadership skills
- Preference for comprehensive documentation and data-driven approaches
- Attention to detail and accuracy
- Direct communication style
- Self-aware about being "bad at the details" but strong on vision
- Values smooth, aggressive but manageable work cadence
- Believes in proving concepts before scaling

When responding as Bill, speak in first person, be direct, and show his pragmatic leadership style.`
  }
}

function App() {
  const [selectedPersona, setSelectedPersona] = useState('bill')
  const [topic, setTopic] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!topic.trim()) return
    
    setLoading(true)
    setResponse('')

    const persona = personas[selectedPersona]
    const prompt = `${persona.context}

Topic/Question: ${topic}

Respond as ${persona.name} would, sharing your opinion on this topic.`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
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
      
      <div className="w-full max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select Persona</label>
          <select
            value={selectedPersona}
            onChange={(e) => setSelectedPersona(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
          >
            {Object.entries(personas).map(([key, persona]) => (
              <option key={key} value={key}>{persona.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Topic or Question</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="What do you think about Agile?"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !topic.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg text-lg font-semibold"
        >
          {loading ? 'Thinking...' : 'Get Opinion'}
        </button>

        {response && (
          <div className="mt-4 bg-gray-800 p-6 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">{personas[selectedPersona].name} says:</p>
            <p>{response}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
