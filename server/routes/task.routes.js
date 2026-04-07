const express = require('express');
const router = express.Router();
const { createTask, getTasksByProject, updateTask, deleteTask, addComment } = require('../controllers/task.controller');
const { auth, checkRole } = require('../middleware/auth.middleware');

router.post('/', auth, checkRole(['Admin', 'Manager']), createTask);
router.get('/project/:projectId', auth, getTasksByProject);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, checkRole(['Admin', 'Manager']), deleteTask);
router.post('/:id/comments', auth, addComment);

module.exports = router;
