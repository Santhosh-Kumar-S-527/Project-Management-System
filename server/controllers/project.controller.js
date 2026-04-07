const Project = require('../models/project.model');
const ActivityLog = require('../models/activityLog.model');

exports.createProject = async (req, res) => {
    try {
        const { title, description, members, status, deadline } = req.body;
        const project = new Project({
            title,
            description,
            members,
            status,
            deadline,
            manager: req.user.id
        });
        await project.save();

        const activity = new ActivityLog({
            userId: req.user.id,
            action: 'CREATED_PROJECT',
            details: `Created project: ${title}`
        });
        await activity.save();

        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getProjects = async (req, res) => {
    try {
        let projects;
        if (req.user.role === 'Admin') {
            projects = await Project.find().populate('members', 'name email').populate('manager', 'name email');
        } else if (req.user.role === 'Manager') {
            projects = await Project.find({ manager: req.user.id }).populate('members', 'name email');
        } else {
            projects = await Project.find({ members: req.user.id }).populate('manager', 'name email');
        }
        res.json(projects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('members', 'name email').populate('manager', 'name email');
        if (!project) return res.status(404).json({ msg: 'Project not found' });
        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteProject = async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Project deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
