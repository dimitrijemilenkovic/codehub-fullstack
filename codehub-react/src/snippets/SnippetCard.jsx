import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'


export default function SnippetCard({ title, code, language='javascript' }){
// Sanitize title to prevent XSS
const sanitizedTitle = title ? String(title).replace(/[<>]/g, '') : 'Untitled'

return (
<div className="card" style={{overflow:'hidden'}}>
<div style={{fontWeight:700, marginBottom:8}}>{sanitizedTitle}</div>
<SyntaxHighlighter language={language} style={vscDarkPlus} customStyle={{margin:0, borderRadius:16}}>
{code || ''}
</SyntaxHighlighter>
</div>
)
}