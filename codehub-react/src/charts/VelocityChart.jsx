import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function VelocityChart({ data, loading }){
  if (loading) {
    return (
      <div className="card" style={{ padding: '40px' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '28px', fontSize: '1.375rem' }}>
          Završeni taskovi (7 dana)
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

  // Format data for chart - fix API response mapping
  const formattedData = data?.map(item => ({
    date: item.day,
    done: parseInt(item.done) || 0
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
          🎯 Završeni taskovi
        </h3>
        <p style={{ 
          margin: 0, 
          color: 'var(--color-gray-600)', 
          fontSize: '1rem' 
        }}>
          Broj završenih taskova u poslednjih 7 dana
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
            formatter={(value, name) => [value, 'taskova']}
          />
          <Line 
            type="monotone" 
            dataKey="done" 
            stroke="var(--color-blue-600)" 
            strokeWidth={3} 
            dot={{ 
              fill: 'var(--color-blue-600)', 
              strokeWidth: 2, 
              r: 4 
            }}
            activeDot={{ 
              r: 6, 
              stroke: 'var(--color-blue-600)', 
              strokeWidth: 2 
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
