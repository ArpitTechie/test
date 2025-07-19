document.addEventListener('DOMContentLoaded', () => {
    const dateContainer = document.getElementById('date-container');
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateContainer.textContent = today.toLocaleDateString('en-US', options);

    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const congratsMessage = document.getElementById('congrats-message');
    const dailyLogInput = document.getElementById('daily-log-input');
    const myChart = document.getElementById('myChart');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let dailyLog = localStorage.getItem('dailyLog') || '';
    let weeklyData = JSON.parse(localStorage.getItem('weeklyData')) || {
        labels: [],
        data: []
    };

    const renderTasks = () => {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <input type="checkbox" data-index="${index}" ${task.completed ? 'checked' : ''}>
                <span>${task.text}</span>
                <button data-index="${index}">Delete</button>
            `;
            if (task.completed) {
                li.classList.add('completed');
            }
            taskList.appendChild(li);
        });
        checkAllTasksCompleted();
    };

    const addTask = () => {
        const text = taskInput.value.trim();
        if (text) {
            tasks.push({ text, completed: false });
            taskInput.value = '';
            renderTasks();
            saveData();
        }
    };

    const deleteTask = (index) => {
        tasks.splice(index, 1);
        renderTasks();
        saveData();
    };

    const toggleTask = (index) => {
        tasks[index].completed = !tasks[index].completed;
        renderTasks();
        saveData();
    };

    const checkAllTasksCompleted = () => {
        const allCompleted = tasks.every(task => task.completed);
        if (allCompleted && tasks.length > 0) {
            congratsMessage.classList.remove('hidden');
        } else {
            congratsMessage.classList.add('hidden');
        }
    };

    const saveData = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('dailyLog', dailyLogInput.value);
        localStorage.setItem('weeklyData', JSON.stringify(weeklyData));
    };

    const updateChart = () => {
        const today = new Date();
        const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
        const completedTasks = tasks.filter(task => task.completed).length;

        const dayIndex = weeklyData.labels.indexOf(dayOfWeek);
        if (dayIndex > -1) {
            weeklyData.data[dayIndex] = completedTasks;
        } else {
            weeklyData.labels.push(dayOfWeek);
            weeklyData.data.push(completedTasks);
        }

        if (weeklyData.labels.length > 7) {
            weeklyData.labels.shift();
            weeklyData.data.shift();
        }

        new Chart(myChart, {
            type: 'bar',
            data: {
                labels: weeklyData.labels,
                datasets: [{
                    label: 'Completed Tasks',
                    data: weeklyData.data,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        saveData();
    };

    addTaskBtn.addEventListener('click', addTask);

    taskList.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            deleteTask(e.target.dataset.index);
        }
        if (e.target.tagName === 'INPUT') {
            toggleTask(e.target.dataset.index);
        }
    });

    dailyLogInput.addEventListener('input', () => {
        saveData();
    });

    renderTasks();
    dailyLogInput.value = dailyLog;
    updateChart();
});
