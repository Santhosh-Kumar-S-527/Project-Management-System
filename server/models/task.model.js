const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['To-do', 'In Progress', 'Done'], default: 'To-do' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    deadline: { type: Date },
    attachments: [{ type: String }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
