import { Router } from 'express'
import { auth } from '../middleware/auth.js'
import { listSnippets, createSnippet, updateSnippet, deleteSnippet } from '../controllers/snippetController.js'

const router = Router()
router.get('/', auth, listSnippets)
router.post('/', auth, createSnippet)
router.put('/:id', auth, updateSnippet)
router.delete('/:id', auth, deleteSnippet)
export default router
