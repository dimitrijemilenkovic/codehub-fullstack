import { useLocalStorage } from './useLocalStorage.js'


export function useSnippets(){
const [snippets, setSnippets] = useLocalStorage('codehub_snippets', [])


function add({ title, code, language, tags = [] }){
const now = new Date().toISOString()
const s = { id: crypto.randomUUID(), title: title?.trim() || 'Snippet', code: code || '', language: language || 'javascript', tags, createdAt: now, updatedAt: now }
setSnippets(ss => [s, ...ss])
}


function update(id, patch){
const now = new Date().toISOString()
setSnippets(ss => ss.map(s => s.id===id ? { ...s, ...patch, updatedAt: now } : s))
}


function remove(id){ setSnippets(ss => ss.filter(s => s.id!==id)) }


function search(q){
const needle = q.trim().toLowerCase()
if(!needle) return snippets
return snippets.filter(s => s.title.toLowerCase().includes(needle) || s.code.toLowerCase().includes(needle) || s.tags?.some(t => t.toLowerCase().includes(needle)))
}


return { snippets, add, update, remove, search }
}