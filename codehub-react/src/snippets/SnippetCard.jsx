import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'


export default function SnippetCard({ snippet, onEdit, onDelete }){
  const { title, code, language = 'javascript' } = snippet;
  
  return (
    <div className="snippet-card" style={{padding: '16px'}}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
      }}>
        <div style={{fontWeight:700, color:'var(--color-gray-800)'}}>{title}</div>
        <div style={{display: 'flex', gap: '8px'}}>
          <button 
            className="btn btn-outline" 
            style={{fontSize: '12px', padding: '4px 8px'}}
            onClick={onEdit}
          >
            Uredi
          </button>
          <button 
            className="btn btn-outline" 
            style={{fontSize: '12px', padding: '4px 8px', color: 'var(--color-red-600)'}}
            onClick={onDelete}
          >
            Obriši
          </button>
        </div>
      </div>
      <div style={{
        background: '#fafafa',
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)'
      }}>
        <SyntaxHighlighter 
          language={language} 
          style={oneLight} 
          customStyle={{
            margin: 0, 
            padding: '16px',
            background: '#fafafa',
            fontSize: '13px',
            fontFamily: 'SF Mono, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
            lineHeight: '1.6',
            borderRadius: '0',
            border: 'none',
            overflow: 'auto',
            maxHeight: '300px'
          }}
          showLineNumbers={true}
          lineNumberStyle={{
            color: '#999',
            fontSize: '12px',
            paddingRight: '12px',
            borderRight: '1px solid #e1e5e9',
            marginRight: '12px',
            minWidth: '35px'
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}