import React, { useState, useEffect } from 'react';
import { PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const FinancialForecast = ({ trip }) => {
  const [budgetBreakdown, setBudgetBreakdown] = useState([]);
  const [dailySpending, setDailySpending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Calculate dates based on duration
        const startDate = new Date();
        const endDate = new Date();
        const duration = parseInt(trip.userChoice.noOfDays);
        endDate.setDate(startDate.getDate() + duration);

        // Format dates as YYYY-MM-DD
        const formatDate = (date) => {
          return date.toISOString().split('T')[0];
        };

        // Determine budget based on preference
        const budgetMap = {
          'Budget-Friendly': 3000,
          'Mid-Range': 5000,
          'Luxury': 8000
        };

        const requestData = {
          source_city: "New York", // Default as not provided in trip data
          destination: trip.userChoice.location.label.split(',')[0],
          start_date: formatDate(startDate),
          end_date: formatDate(endDate),
          budget: budgetMap[trip.userChoice.budget] || 3000,
          currency: "USD"
        };

        const response = await fetch('http://localhost:5000/api/travel/plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setBudgetBreakdown(data.plan.financial_data.chart_data.budget_breakdown);
        setDailySpending(data.plan.financial_data.chart_data.daily_spending_trend);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (trip) {
      fetchData();
    }
  }, [trip]);

  if (loading) {
    return <div className="w-full p-4 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="w-full p-4 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="w-full p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Financial Forecast</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Budget Breakdown Pie Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Budget Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={budgetBreakdown}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {budgetBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Spending Trend Line Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Daily Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailySpending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }}
                name="Daily Spend"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FinancialForecast;