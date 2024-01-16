document.addEventListener("DOMContentLoaded", () => {
  const addTaskBtn = document.getElementById('add-task-btn');
  const taskList = document.querySelector('.task-list');
  const importantTaskList = document.querySelector('.important-task-list');
  const plannedTaskList = document.querySelector('.planned-task-list');
  const taskInput = document.getElementById('task-input');
  const dueDateInput = document.getElementById('due-date-input');
  const navLinks = document.querySelectorAll('.menu .nav-link');
  const starButtons = document.querySelectorAll('.star-btn');
  const importantLink = document.querySelector('.menu .nav-link:nth-child(2)');
  const myDayLink = document.querySelector('.menu .nav-link:nth-child(1)');
  const plannedLink = document.querySelector('.menu .nav-link:nth-child(3)');

  const tasks = []; // Array to store all tasks

  function isToday(dueDate) {
    const today = new Date();
    return (
      dueDate.getFullYear() === today.getFullYear() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getDate() === today.getDate()
    );
  }

  function isSameDay(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  function createTask(name, dueDate) {
    // Adjust for the timezone offset
    const timezoneOffset = dueDate.getTimezoneOffset();
    dueDate = new Date(dueDate.getTime() + timezoneOffset * 60 * 1000);

    const taskItem = document.createElement('div');
    taskItem.classList.add('task');

    const taskCheckbox = document.createElement('input');
    taskCheckbox.type = 'checkbox';
    taskCheckbox.className = 'task-checkbox';
    taskCheckbox.addEventListener('change', () => {
      if (taskCheckbox.checked) {
        taskItem.classList.add('completed');
      } else {
        taskItem.classList.remove('completed');
      }
    });

    const taskText = document.createElement('span');
    taskText.textContent = name;
    taskText.className = 'task-text';

    const taskDueDate = document.createElement('span');
    taskDueDate.textContent = dueDate.toLocaleDateString(); // Format the date
    taskDueDate.className = 'task-due-date';

    const taskActionsContainer = document.createElement('div');
    taskActionsContainer.classList.add('task-actions');

    const starBtn = document.createElement('button');
    starBtn.textContent = 'Star';
    starBtn.className = 'star-btn';
    starBtn.onclick = () => toggleImportant(taskItem, name);

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-btn';
    editBtn.onclick = () => makeEditable(taskText, editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.onclick = () => deleteTask(taskItem, name);

    taskActionsContainer.appendChild(starBtn);
    taskActionsContainer.appendChild(editBtn);
    taskActionsContainer.appendChild(deleteBtn);

    taskItem.appendChild(taskCheckbox);
    taskItem.appendChild(taskText);
    taskItem.appendChild(taskDueDate);
    taskItem.appendChild(taskActionsContainer);

    if (!isToday(dueDate)) {
      plannedTaskList.appendChild(taskItem);
    } else {
      myDayLink.classList.add('active');
      taskList.appendChild(taskItem);
    }

    return taskItem;
  }

  function toggleImportant(taskItem, name) {
    const isImportant = taskItem.classList.toggle('important');
    const index = tasks.findIndex(task => task.name === name);

    if (isImportant) {
      importantTaskList.appendChild(taskItem);
      tasks[index].important = true;
    } else {
      plannedTaskList.appendChild(taskItem);
      tasks[index].important = false;
    }
    updateNavLinksActiveState();
  }

  function makeEditable(taskTextElement, editButton) {
    const originalText = taskTextElement.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalText;
    input.className = 'edit-input';

    taskTextElement.parentNode.replaceChild(input, taskTextElement);

    editButton.textContent = 'Save';
    editButton.onclick = () => saveEdits(input, originalText, editButton);
  }

  function saveEdits(inputElement, originalText, editButton) {
    const newTaskText = document.createElement('span');
    newTaskText.className = 'task-text';
    newTaskText.textContent = inputElement.value.trim() || originalText;

    inputElement.parentNode.replaceChild(newTaskText, inputElement);

    editButton.textContent = 'Edit';
    editButton.onclick = () => makeEditable(newTaskText, editButton);
  }

  function deleteTask(taskItem, name) {
    taskItem.remove();
    const index = tasks.findIndex(task => task.name === name);
    if (index !== -1) {
      tasks.splice(index, 1);
    }
    updateNavLinksActiveState();
  }

  addTaskBtn.addEventListener('click', () => {
    const taskName = taskInput.value.trim();
    const dueDate = new Date(dueDateInput.value);

    if (taskName && dueDate) {
      const taskItem = createTask(taskName, dueDate);
      tasks.push({ name: taskName, important: false, dueDate: dueDate });
      taskInput.value = '';
      dueDateInput.value = '';
    }
  });

  navLinks.forEach(navLink => {
    navLink.addEventListener('click', () => {
      navLinks.forEach(link => link.classList.remove('active'));
      navLink.classList.add('active');

      const index = navLink.getAttribute('data-index');
      switch (index) {
        case '1':
          importantTaskList.classList.remove('hidden');
          taskList.classList.add('hidden');
          plannedTaskList.classList.add('hidden');
          showImportantTasks();
          break;
        case '2':
          plannedTaskList.classList.remove('hidden');
          taskList.classList.add('hidden');
          importantTaskList.classList.add('hidden');
          showPlannedTasks();
          break;
        default:
          taskList.classList.remove('hidden');
          importantTaskList.classList.add('hidden');
          plannedTaskList.classList.add('hidden');
          showSelectedTasks(index);
          break;
      }
    });
  });

  starButtons.forEach((starBtn, index) => {
    starBtn.addEventListener('click', () => {
      const taskItem = starBtn.closest('.task');
      const taskText = taskItem.querySelector('.task-text');
      toggleImportant(taskItem, taskText.textContent);
    });
  });

  function showSelectedTasks(index) {
    const taskItems = document.querySelectorAll('.task');

    taskItems.forEach(taskItem => {
      const isImportant = taskItem.classList.contains('important');
      const taskDueDate = new Date(tasks.find(task => task.name === taskItem.querySelector('.task-text').textContent).dueDate);

      switch (index) {
        case '0':
          if (isToday(taskDueDate)) {
            taskItem.style.display = 'block';
          } else {
            taskItem.style.display = 'none';
          }
          break;
        default:
          if (isImportant && index !== '1') {
            taskItem.style.display = 'none';
          } else {
            taskItem.style.display = 'block';
          }
          break;
      }
    });
  }

  function showImportantTasks() {
    const taskItems = document.querySelectorAll('.task');

    taskItems.forEach(taskItem => {
      if (taskItem.classList.contains('important')) {
        taskItem.style.display = 'block';
      } else {
        taskItem.style.display = 'none';
      }
    });
  }

  function showPlannedTasks() {
    const taskItems = document.querySelectorAll('.task');

    taskItems.forEach(taskItem => {
      const isImportant = taskItem.classList.contains('important');
      const taskDueDate = new Date(tasks.find(task => task.name === taskItem.querySelector('.task-text').textContent).dueDate);

      if (!isSameDay(taskDueDate, new Date()) && !isImportant) {
        taskItem.style.display = 'block';
      } else {
        taskItem.style.display = 'none';
      }
    });
  }

  function updateNavLinksActiveState() {
    if (importantTaskList.children.length > 0) {
      importantLink.classList.add('active');
      myDayLink.classList.remove('active');
      plannedLink.classList.remove('active');
    } else if (plannedTaskList.children.length > 0) {
      plannedLink.classList.add('active');
      myDayLink.classList.remove('active');
      importantLink.classList.remove('active');
    } else {
      myDayLink.classList.add('active');
      importantLink.classList.remove('active');
      plannedLink.classList.remove('active');
    }
  }
});
