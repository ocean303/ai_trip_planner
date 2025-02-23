import React, { useState, useEffect, useRef } from 'react';

const TravelChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [travelContext, setTravelContext] = useState({
    source_city: '',
    destination: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 1000,
    currency: 'USD'
  });

  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/travel/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          chat_history: messages.map(m => `${m.type}: ${m.content}`).join('\n'),
          travel_context: travelContext
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { 
        type: 'assistant', 
        content: data.response,
        context: data.context 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: 'Sorry, there was an error processing your request.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div className="bg-white p-4 mb-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Travel Planning Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="From City"
            className="p-2 border rounded"
            value={travelContext.source_city}
            onChange={(e) => setTravelContext(prev => ({
              ...prev,
              source_city: e.target.value
            }))}
          />
          <input
            type="text"
            placeholder="To City"
            className="p-2 border rounded"
            value={travelContext.destination}
            onChange={(e) => setTravelContext(prev => ({
              ...prev,
              destination: e.target.value
            }))}
          />
          <input
            type="date"
            className="p-2 border rounded"
            value={travelContext.start_date}
            onChange={(e) => setTravelContext(prev => ({
              ...prev,
              start_date: e.target.value
            }))}
          />
          <input
            type="date"
            className="p-2 border rounded"
            value={travelContext.end_date}
            onChange={(e) => setTravelContext(prev => ({
              ...prev,
              end_date: e.target.value
            }))}
          />
          <input
            type="number"
            placeholder="Budget"
            className="p-2 border rounded"
            value={travelContext.budget}
            onChange={(e) => setTravelContext(prev => ({
              ...prev,
              budget: parseInt(e.target.value)
            }))}
          />
          <select
            className="p-2 border rounded"
            value={travelContext.currency}
            onChange={(e) => setTravelContext(prev => ({
              ...prev,
              currency: e.target.value
            }))}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.type === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-4 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : message.type === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-white shadow'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              {message.context && (
                <div className="mt-4 text-sm border-t pt-2">
                  {message.context.weather && message.context.weather.forecast && (
                    <div className="mt-1">
                      <strong>Weather Forecast:</strong>
                      <ul className="list-disc pl-4">
                        {message.context.weather.forecast.slice(0, 3).map((day, idx) => (
                          <li key={idx}>
                            {day.date}: {day.temp}°C, {day.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {message.context.events?.length > 0 && (
                    <div className="mt-2">
                      <strong>Upcoming Events:</strong>
                      <ul className="list-disc pl-4">
                        {message.context.events.slice(0, 3).map((event, idx) => (
                          <li key={idx}>
                            {event.title} ({new Date(event.date).toLocaleDateString()})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {message.context.financial_data && (
                    <div className="mt-2">
                      <strong>Budget Breakdown:</strong>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {Object.entries(message.context.financial_data.allocations).map(([category, amount]) => (
                          <div key={category} className="text-xs">
                            {category}: {amount} {message.context.financial_data.summary.currency}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your travel plans..."
          className="flex-1 p-2 border rounded"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default TravelChat;