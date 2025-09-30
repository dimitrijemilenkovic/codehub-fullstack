import { useEffect, useState } from 'react'
import SnippetCard from '../snippets/SnippetCard.jsx'
import { api } from '../services/api.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

export default function Snippets(){
	console.log('SNIPPETS COMPONENT RENDERING!');
	usePageTitle('Snippeti')
	const [snippets, setSnippets] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [form, setForm] = useState({ title: '', language: 'javascript', code: '' })
	const [editingId, setEditingId] = useState(null)
	const [editForm, setEditForm] = useState({ title: '', language: 'javascript', code: '' })

	useEffect(() => {
		let mounted = true
		async function load(){
			try {
				const data = await api.get('/api/snippets')
				if (mounted) setSnippets(data)
			} catch(e){
				setError(e.message)
			} finally {
				setLoading(false)
			}
		}
		load()
		return () => { mounted = false }
	}, [])

	async function handleAdd(e){
		console.log('SNIPPET ADD FUNCTION CALLED!', { form });
		e.preventDefault()
		setError('')
		try {
			const payload = {
				title: form.title,
				language: form.language,
				code: form.code
			}
			const created = await api.post('/api/snippets', payload)
			setSnippets(s => [created, ...s])
			setForm({ title: '', language: 'javascript', code: '' })
		} catch(e){
			setError(e.message)
		}
	}

	function startEdit(s){
		setEditingId(s.id)
		setEditForm({ title: s.title, language: s.language, code: s.code })
	}

	async function saveEdit(e){
		e.preventDefault()
		try{
			const payload = {
				title: editForm.title,
				language: editForm.language,
				code: editForm.code
			}
			const updated = await api.put(`/api/snippets/${editingId}`, payload)
			setSnippets(list => list.map(s => s.id===editingId ? updated : s))
			setEditingId(null)
		}catch(e){ setError(e.message) }
	}

	async function remove(id){
		try{
			await api.delete(`/api/snippets/${id}`)
			setSnippets(list => list.filter(s => s.id !== id))
		}catch(e){ setError(e.message) }
	}

	return (
		<div style={{display:'grid', gap:24}}>
			{/* Add Snippet Form */}
			<div className="card">
				<h3 style={{fontWeight:700, marginBottom:16}}>Dodaj novi snippet</h3>
				<form onSubmit={handleAdd} style={{display:'grid', gap:12}}>
					<input 
						className="input"
						placeholder="Naslov snippeta" 
						value={form.title} 
						onChange={e=>{
							console.log('Snippet input changed:', e.target.value);
							setForm(f=>({...f, title:e.target.value}));
						}} 
					/>
					<select 
						className="input"
						value={form.language} 
						onChange={e=>setForm(f=>({...f, language:e.target.value}))}
					>
						<option>javascript</option>
						<option>typescript</option>
						<option>python</option>
						<option>java</option>
						<option>csharp</option>
						<option>html</option>
						<option>css</option>
						<option>sql</option>
					</select>
					<textarea 
						className="textarea"
						placeholder="Kod snippeta..." 
						rows={8} 
						value={form.code} 
						onChange={e=>setForm(f=>({...f, code:e.target.value}))} 
					/>
					<button type="submit" className="btn btn-primary">Sačuvaj snippet</button>
				</form>
				{error && <div style={{color:'var(--color-danger-600)', marginTop:12}}>{error}</div>}
			</div>

			{/* Snippets List */}
			{loading ? (
				<div className="card">Učitavanje snippeta...</div>
			) : (
				<div style={{display:'grid', gap:16}}>
					{snippets.length === 0 ? (
						<div className="card" style={{textAlign:'center', padding:'48px 24px'}}>
							<h3 style={{margin:'0 0 8px 0', color:'var(--color-gray-600)'}}>Nema snippeta</h3>
							<p style={{margin:0, color:'var(--color-gray-500)'}}>Dodaj svoj prvi snippet koristeći formu iznad</p>
						</div>
					) : (
						snippets.map(s => (
							<div key={s.id} className="snippet-card">
								{editingId===s.id ? (
									<div style={{padding:24}}>
										<form onSubmit={saveEdit} style={{display:'grid', gap:12}}>
											<input 
												className="input"
												value={editForm.title} 
												onChange={e=>setEditForm(f=>({...f, title:e.target.value}))} 
											/>
											<select 
												className="input"
												value={editForm.language} 
												onChange={e=>setEditForm(f=>({...f, language:e.target.value}))}
											>
												<option>javascript</option>
												<option>typescript</option>
												<option>python</option>
												<option>java</option>
												<option>csharp</option>
												<option>html</option>
												<option>css</option>
												<option>sql</option>
											</select>
											<textarea 
												className="textarea"
												rows={8} 
												value={editForm.code} 
												onChange={e=>setEditForm(f=>({...f, code:e.target.value}))} 
											/>
											<div style={{display:'flex', gap:12}}>
												<button type="submit" className="btn btn-primary">Sačuvaj</button>
												<button type="button" className="btn btn-secondary" onClick={()=>setEditingId(null)}>Otkaži</button>
											</div>
										</form>
									</div>
								) : (
									<SnippetCard 
										snippet={s} 
										onEdit={()=>startEdit(s)} 
										onDelete={()=>remove(s.id)} 
									/>
								)}
							</div>
						))
					)}
				</div>
			)}
		</div>
	)
}
