import { useEffect, useState } from 'react'
import SnippetCard from '../snippets/SnippetCard.jsx'
import { api } from '../services/api.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

export default function Snippets(){
	usePageTitle('Snippeti')
	const [snippets, setSnippets] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [form, setForm] = useState({ title: '', language: 'javascript', code: '', tags: '' })
	const [editingId, setEditingId] = useState(null)
	const [editForm, setEditForm] = useState({ title: '', language: 'javascript', code: '', tags: '' })

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
		e.preventDefault()
		setError('')
		try {
			const payload = {
				title: form.title,
				language: form.language,
				code: form.code,
				tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
			}
			const created = await api.post('/api/snippets', payload)
			setSnippets(s => [created, ...s])
			setForm({ title: '', language: 'javascript', code: '', tags: '' })
		} catch(e){
			setError(e.message)
		}
	}

	function startEdit(s){
		setEditingId(s.id)
		setEditForm({ title: s.title, language: s.language, code: s.code, tags: (s.tags||[]).join(', ') })
	}

	async function saveEdit(e){
		e.preventDefault()
		try{
			const payload = {
				title: editForm.title,
				language: editForm.language,
				code: editForm.code,
				tags: editForm.tags.split(',').map(s => s.trim()).filter(Boolean),
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
						onChange={e=>setForm(f=>({...f, title:e.target.value}))} 
					/>
					<div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
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
						<input 
							className="input"
							placeholder="Tagovi (razdvoji zarezom)" 
							value={form.tags} 
							onChange={e=>setForm(f=>({...f, tags:e.target.value}))} 
						/>
					</div>
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
											<div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
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
												<input 
													className="input"
													value={editForm.tags} 
													onChange={e=>setEditForm(f=>({...f, tags:e.target.value}))} 
												/>
											</div>
											<textarea 
												className="textarea"
												rows={8} 
												value={editForm.code} 
												onChange={e=>setEditForm(f=>({...f, code:e.target.value}))} 
											/>
											<div style={{display:'flex', gap:8}}>
												<button className="btn btn-primary" type="submit">Sačuvaj izmene</button>
												<button type="button" className="btn btn-outline" onClick={()=>setEditingId(null)}>
													Otkaži
												</button>
											</div>
										</form>
									</div>
								) : (
									<>
										<div className="snippet-header">
											<div className="snippet-title">{s.title}</div>
											<div className="snippet-actions">
												<button className="btn btn-outline" onClick={()=>startEdit(s)}>
													Izmeni
												</button>
												<button 
													className="btn btn-outline" 
													onClick={()=>remove(s.id)}
													style={{borderColor:'var(--color-danger-300)', color:'var(--color-danger-600)'}}
												>
													Obriši
												</button>
											</div>
										</div>
										<div className="snippet-content">
											<div className="snippet-meta">
												<span>Jezik: <strong>{s.language}</strong></span>
												<span>Kreiran: {new Date(s.created_at).toLocaleDateString('sr-RS')}</span>
											</div>
											<SnippetCard title={s.title} code={s.code} language={s.language} />
											{s.tags && s.tags.length > 0 && (
												<div className="snippet-tags">
													{s.tags.map((tag, i) => (
														<span key={i} className="snippet-tag">{tag}</span>
													))}
												</div>
											)}
										</div>
									</>
								)}
							</div>
						))
					)}
				</div>
			)}
		</div>
	)
}
