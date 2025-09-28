import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function ProgressChart({ data, loading }){
  if (loading) {
    return (
      <div className="card" style={{ padding: '40px' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '28px', fontSize: '1.375rem' }}>
          Fokus minuti (7 dana)
        </h3>
        <div style={{ 
          height: '250px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'var(--color-gray-500)'
        }}>
          Učitavanje...
        </div>
      </div>
    )
  }

  // Format data for chart
  const formattedData = data?.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('sr-RS', { 
      month: 'short', 
      day: 'numeric' 
    })
  })) || []

  return (
    <div className="card" style={{ padding: '40px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ 
          fontWeight: 700, 
          marginBottom: '8px', 
          fontSize: '1.375rem',
          color: 'var(--color-gray-900)'
        }}>
          Fokus minuti
        </h3>
        <p style={{ 
          margin: 0, 
          color: 'var(--color-gray-600)', 
          fontSize: '1rem' 
        }}>
          Broj minuta fokusa u poslednjih 7 dana
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={250}>
        <LineChart 
          data={formattedData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="var(--color-gray-200)"
            opacity={0.5}
          />
          <XAxis 
            dataKey="date" 
            stroke="var(--color-gray-600)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="var(--color-gray-600)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'var(--color-white)',
              border: '1px solid var(--color-gray-200)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value, name) => [value, 'minuta']}
          />
          <Line 
            type="monotone" 
            dataKey="total_minutes" 
            stroke="var(--color-green-600)" 
            strokeWidth={3} 
            dot={{ 
              fill: 'var(--color-green-600)', 
              strokeWidth: 2, 
              r: 4 
            }}
            activeDot={{ 
              r: 6, 
              stroke: 'var(--color-green-600)', 
              strokeWidth: 2 
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
