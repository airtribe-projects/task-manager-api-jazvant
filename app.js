const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let tasks = [
  { id: 1, title: "Sample Task 1", description: "This is a sample task", completed: false },
  { id: 2, title: "Sample Task 2", description: "This is another task", completed: true }
];

// GET /tasks: Retrieve all tasks
app.get('/tasks', (req, res) => {
  // Respond with the list of tasks
  res.status(200).json(tasks);  // HTTP 200 OK and the tasks array in the response body
});

app.get('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);  // Get the task ID from the URL
  
  // Find the task with the matching ID
  const task = tasks.find(t => t.id === taskId); 

  // If task is found, return it with 200 status
  if (task) {
    res.status(200).json(task);  // Send the task as a JSON response
  } else {
    // If task not found, return a 404 error with a message
    res.status(404).json({ message: "Task not found" });
  }
});

// POST /tasks: Create a new task
app.post('/tasks', (req, res) => {
  const { title, description, completed } = req.body;

  // Simple validation to check if all required fields are provided
  if (!title || !description || typeof completed !== 'boolean') {
    return res.status(400).json({ message: "Invalid data. Please provide title, description, and completed status." });
  }

  // Create a new task
  const newTask = {
    id: tasks.length + 1,  // Simple ID generator (can be improved with a better strategy)
    title,
    description,
    completed
  };

  // Add the new task to the tasks array
  tasks.push(newTask);

  // Return the newly created task with 201 status
  res.status(201).json(newTask);
});

// PUT /tasks/:id: Update an existing task
app.put('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);  // Get the task ID from the URL
  const { title, description, completed } = req.body;

  // Input validation (same as POST)
  if (!title || !description || typeof completed !== 'boolean') {
    return res.status(400).json({ message: "Invalid data. Please provide title, description, and completed status." });
  }

  // Find the task with the matching ID
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  // If the task is not found
  if (taskIndex === -1) {
    return res.status(404).json({ message: "Task not found" });
  }

  // Update the task with new data
  tasks[taskIndex] = { id: taskId, title, description, completed };

  // Respond with the updated task
  res.status(200).json(tasks[taskIndex]);
});

app.delete('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);  // Get the task ID from the URL

  // Find the index of the task with the matching ID
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  // If the task is not found
  if (taskIndex === -1) {
    return res.status(404).json({ message: "Task not found" });
  }

  // Remove the task from the tasks array
  tasks.splice(taskIndex, 1);

  // Return a success message with 200 OK
  res.status(200).json({ message: "Task deleted successfully" });
});


// Filtering by completion status 
app.get('/tasks', (req, res) => {
  let filteredTasks = tasks;

  if (req.query.completed !== undefined) {
    const completedFilter = req.query.completed === 'true';
    filteredTasks = tasks.filter(task => task.completed === completedFilter);
  }

  res.status(200).json(filteredTasks);
});

// Sorting by creation date 
app.get('/tasks', (req, res) => {
  let filteredTasks = tasks;

  // Filter by completed status (if provided)
  if (req.query.completed !== undefined) {
    const completedFilter = req.query.completed === 'true';
    filteredTasks = tasks.filter(task => task.completed === completedFilter);
  }

  // Sort tasks by creation date (if sort is provided)
  if (req.query.sort) {
    const sortOrder = req.query.sort === 'asc' ? 1 : -1;
    filteredTasks = filteredTasks.sort((a, b) => (new Date(a.createdAt) - new Date(b.createdAt)) * sortOrder);
  }

  res.status(200).json(filteredTasks);
});


// Addition of the priority field 
app.post('/tasks', (req, res) => {
  const { title, description, completed, priority = 'low' } = req.body;  // Default to 'low' priority if not provided

  if (!title || !description || typeof completed !== 'boolean' || !['low', 'medium', 'high'].includes(priority)) {
    return res.status(400).json({ message: "Invalid data. Please provide title, description, completed status, and a valid priority." });
  }

  const newTask = {
    id: tasks.length + 1,
    title,
    description,
    completed,
    priority
  };

  tasks.push(newTask);

  res.status(201).json(newTask);
});

app.get('/tasks/priority/:level', (req, res) => {
  const { level } = req.params;

  if (!['low', 'medium', 'high'].includes(level)) {
    return res.status(400).json({ message: "Invalid priority level. Please use 'low', 'medium', or 'high'." });
  }

  const priorityTasks = tasks.filter(task => task.priority === level);

  res.status(200).json(priorityTasks);
});


app.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }
    console.log(`Server is listening on ${port}`);
});



module.exports = app;