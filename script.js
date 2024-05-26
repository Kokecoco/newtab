// ToDoリストの処理
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');

// メモの処理
const memoInput = document.getElementById('memoInput');

// プロジェクト管理の処理
const projectInput = document.getElementById('projectInput');
const projectList = document.getElementById('projectList');
const taskContainer = document.getElementById('taskContainer');

let projects = JSON.parse(localStorage.getItem('projects')) || [];
let currentProjectId = null;

window.onload = () => {
    // ToDoリストの復元
    const savedTodos = JSON.parse(localStorage.getItem('todos')) || [];
    savedTodos.forEach(todo => addTodoToList(todo));

    // メモの復元
    const savedMemo = localStorage.getItem('memo') || '';
    memoInput.value = savedMemo;

    // プロジェクトの復元
    projects.forEach(project => addProjectToList(project));

    // 毎日の予定をローカルストレージから取得する
    const scheduleData = JSON.parse(localStorage.getItem('schedule')) || [];

    // 予定を現在時刻に近い順にソートする
    scheduleData.sort((a, b) => new Date(a.time) - new Date(b.time));

    // 予定の表示を更新
    updateScheduleList(scheduleData);
};

function addTodo() {
    const todoText = todoInput.value.trim();
    if (todoText === '') return;

    addTodoToList(todoText);
    todoInput.value = '';
    saveTodos();
}

function addTodoToList(todoText) {
    const li = document.createElement('li');
    li.className = 'todo-item';

    const textSpan = document.createElement('span');
    textSpan.className = 'todo-text';
    textSpan.textContent = todoText;
    li.appendChild(textSpan);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.innerHTML = '&times;';
    deleteButton.onclick = () => {
        li.remove();
        saveTodos();
    };
    li.appendChild(deleteButton);

    todoList.appendChild(li);
}

function saveTodos() {
    const todos = Array.from(todoList.querySelectorAll('.todo-text')).map(span => span.textContent);
    localStorage.setItem('todos', JSON.stringify(todos));
}

memoInput.addEventListener('input', () => {
    localStorage.setItem('memo', memoInput.value);
});

function addProject() {
    const projectName = projectInput.value.trim();
    if (projectName === '') return;

    const projectId = Date.now().toString();
    const project = { id: projectId, name: projectName, tasks: [] };
    projects.push(project);
    addProjectToList(project);
    saveProjects();

    projectInput.value = '';
}

function addProjectToList(project) {
    const li = document.createElement('li');
    li.className = 'project-item';
    li.textContent = project.name;
    li.dataset.id = project.id;
    li.onclick = () => selectProject(project.id);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.innerHTML = '&times;';
    deleteButton.onclick = (e) => {
        e.stopPropagation();
        deleteProject(project.id);
    };
    li.appendChild(deleteButton);

    projectList.appendChild(li);
}

function deleteProject(projectId) {
    projects = projects.filter(project => project.id !== projectId);
    saveProjects();
    renderProjects();
    taskContainer.innerHTML = '<p>プロジェクトを選択してください</p>';
}

function selectProject(projectId) {
    currentProjectId = projectId;
    const project = projects.find(p => p.id === projectId);
    renderTasks(project.tasks);
}

function addTask() {
    if (!currentProjectId) return;

    const taskInput = document.getElementById('taskInput');
    const taskName = taskInput.value.trim();
    if (taskName === '') return;

    const project = projects.find(p => p.id === currentProjectId);
    const taskId = Date.now().toString();
    const task = { id: taskId, name: taskName, status: '未完了' };
    project.tasks.push(task);
    renderTasks(project.tasks);
    saveProjects();

    taskInput.value = '';
}

function renderTasks(tasks) {
    taskContainer.innerHTML = `
        <h2>タスク</h2>
        <input type="text" id="taskInput" placeholder="タスクを追加">
        <button onclick="addTask()">追加</button>
        <ul id="taskList"></ul>
    `;

    const taskList = document.getElementById('taskList');
    tasks.forEach(task => addTaskToList(taskList, task));
}

function addTaskToList(taskList, task) {
    const li = document.createElement('li');
    li.className = 'task-item';

    const textSpan = document.createElement('span');
    textSpan.textContent = task.name;
    li.appendChild(textSpan);

    const statusDiv = document.createElement('div');
    statusDiv.className = 'status';
    statusDiv.innerHTML = `
        <span>${task.status}</span>
        <button onclick="changeTaskStatus('${task.id}', '未完了')">未完了</button>
        <button onclick="changeTaskStatus('${task.id}', '進行中')">進行中</button>
        <button onclick="changeTaskStatus('${task.id}', '完了')">完了</button>
    `;
    li.appendChild(statusDiv);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.innerHTML = '&times;';
    deleteButton.onclick = () => {
        const project = projects.find(p => p.id === currentProjectId);
        project.tasks = project.tasks.filter(t => t.id !== task.id);
        renderTasks(project.tasks);
        saveProjects();
    };
    li.appendChild(deleteButton);

    taskList.appendChild(li);
}

function changeTaskStatus(taskId, status) {
    const project = projects.find(p => p.id === currentProjectId);
    const task = project.tasks.find(t => t.id === taskId);
    task.status = status;
    renderTasks(project.tasks);
    saveProjects();
}

function saveProjects() {
    localStorage.setItem('projects', JSON.stringify(projects));
}

function renderProjects() {
    projectList.innerHTML = '';
    projects.forEach(project => addProjectToList(project));
}
