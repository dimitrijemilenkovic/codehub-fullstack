import { SnippetService } from '../services/snippetService.js'

export const listSnippets = async (req, res) => {
  const { q } = req.query
  const rows = await SnippetService.getAll(req.user.id, q || null)
  res.json(rows)
}

export const createSnippet = async (req, res) => {
  const row = await SnippetService.create(req.user.id, req.body || {})
  res.status(201).json(row)
}

export const updateSnippet = async (req, res) => {
  try {
    const row = await SnippetService.update(req.user.id, req.params.id, req.body || {})
    res.json(row)
  } catch(e) {
    res.status(404).json({ error: 'Not found' })
  }
}

export const deleteSnippet = async (req, res) => {
  try {
    await SnippetService.delete(req.user.id, req.params.id)
    res.status(204).end()
  } catch(e) {
    res.status(404).json({ error: 'Not found' })
  }
}
