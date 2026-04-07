const Task = require('../models/task.model');
const Comment = require('../models/comment.model');
const ActivityLog = require('../models/activityLog.model');

exports.createTask = async (req, res) => {
    try {
        const task = new Task(req.body);
        await task.save();

        const activity = new ActivityLog({
            userId: req.user.id,
            action: 'CREATED_TASK',
            details: `Created task: ${task.title}`
        });
        await activity.save();

        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getTasksByProject = async (req, res) => {
    try {
        const tasks = await Task.find({ projectId: req.params.projectId }).populate('assignedTo', 'name email');
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteTask = async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Task deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.addComment = async (req, res) => {
    try {
        const comment = new Comment({
            taskId: req.params.id,
            userId: req.user.id,
            text: req.body.text
        });
        await comment.save();
        
        await Task.findByIdAndUpdate(req.params.id, { $push: { comments: comment._id } });

        res.json(comment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
