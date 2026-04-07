const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, updateProject, deleteProject } = require('../controllers/project.controller');
const { auth, checkRole } = require('../middleware/auth.middleware');

router.post('/', auth, checkRole(['Admin', 'Manager']), createProject);
router.get('/', auth, getProjects);
router.get('/:id', auth, getProjectById);
router.put('/:id', auth, checkRole(['Admin', 'Manager']), updateProject);
router.delete('/:id', auth, checkRole(['Admin']), deleteProject);

module.exports = router;
