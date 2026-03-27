const Task = require('../models/Task');
const Workspace = require('../models/workspace');

// ✅ Create Task (Team Mode)
const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, deadline, assignedTo, xpReward } = req.body;
    const { workspaceId } = req.params;

    // Check workspace exists
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      status: status || "To Do",
      deadline,
      assignedTo,
      workspace: workspaceId,
      createdBy: req.user.id,
      xpReward: xpReward ? Number(xpReward) : 10,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Tasks of a Workspace
const getWorkspaceTasks = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const tasks = await Task.find({ workspace: workspaceId })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Task
const updateTask = async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.taskId,
      req.body,
      { new: true }
    );

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Task
const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.taskId);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Task Stats for Dashboard
const getTaskStats = async (req, res) => {
  try {
    // Assuming user stats across all tasks they created or are assigned to
    const tasks = await Task.find({
      $or: [{ assignedTo: req.user.id }, { createdBy: req.user.id }],
    });

    const stats = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "To Do").length,
      inProgress: tasks.filter((t) => t.status === "In Progress").length,
      completed: tasks.filter((t) => t.status === "Completed").length,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getWorkspaceTasks, updateTask, deleteTask, getTaskStats };