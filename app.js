const STORAGE_KEYS = { tasks: "taskflow_tasks_v1", user: "taskflow_user_v1" };
const $ = (selector) => document.querySelector(selector);
const taskList = $("#taskList");
const taskDialog = $("#taskDialog");
const loginDialog = $("#loginDialog");
let tasks = loadTasks();
let currentFilter = "all";
let editingId = null;
let toastTimer;

function loadTasks() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    console.warn("Could not read saved tasks:", error);
    return [];
  }
}
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  } catch (error) {
    showToast("Could not save data in this browser.");
    console.error(error);
  }
}
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}
function formatDate(dateString) {
  if (!dateString) return "No due date";
  const date = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "No due date" :
    `Due ${date.toLocaleDateString(undefined, { day: "numeric", month: "short" })}`;
}
function filteredTasks() {
  const query = $("#searchInput").value.trim().toLowerCase();
  const priority = $("#priorityFilter").value;
  return tasks.filter((task) => {
    const statusMatch = currentFilter === "all" ||
      (currentFilter === "active" && !task.completed) ||
      (currentFilter === "completed" && task.completed);
    const queryMatch = `${task.title} ${task.description}`.toLowerCase().includes(query);
    return statusMatch && queryMatch && (priority === "all" || task.priority === priority);
  }).sort((a, b) => Number(a.completed) - Number(b.completed) || b.createdAt - a.createdAt);
}
function renderTasks() {
  const visibleTasks = filteredTasks();
  taskList.innerHTML = visibleTasks.map((task) => `
    <article class="task-card ${task.completed ? "is-complete" : ""}" data-id="${escapeHTML(task.id)}">
      <input class="task-check" type="checkbox" data-action="toggle" aria-label="Mark ${escapeHTML(task.title)} as ${task.completed ? "incomplete" : "complete"}" ${task.completed ? "checked" : ""}>
      <div class="task-main">
        <div class="task-title-line"><span class="task-title">${escapeHTML(task.title)}</span><span class="priority ${escapeHTML(task.priority)}">${escapeHTML(task.priority)}</span></div>
        ${task.description ? `<p class="task-description">${escapeHTML(task.description)}</p>` : ""}
        <div class="task-meta"><span>${escapeHTML(formatDate(task.dueDate))}</span><span class="status-pill">${task.completed ? "Completed" : "In progress"}</span></div>
      </div>
      <div class="task-actions"><button type="button" data-action="edit" aria-label="Edit ${escapeHTML(task.title)}" title="Edit task">✎</button><button type="button" data-action="delete" aria-label="Delete ${escapeHTML(task.title)}" title="Delete task">⌫</button></div>
    </article>`).join("");
  $("#emptyState").hidden = visibleTasks.length > 0;
  taskList.hidden = visibleTasks.length === 0;
  const completed = tasks.filter((task) => task.completed).length;
  const active = tasks.length - completed;
  $("#allCount").textContent = tasks.length;
  $("#totalStat").textContent = tasks.length;
  $("#activeStat").textContent = active;
  $("#completedStat").textContent = completed;
  $("#completionPercent").textContent = tasks.length ? `${Math.round(completed / tasks.length * 100)}%` : "0%";
  $("#listHeading").textContent = ({ all: "All tasks", active: "In progress", completed: "Completed" })[currentFilter];
  document.querySelectorAll(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.filter === currentFilter));
}
function openTaskDialog(task = null) {
  editingId = task ? task.id : null;
  $("#dialogTitle").textContent = task ? "Edit task" : "Create a task";
  $("#taskTitle").value = task?.title || "";
  $("#taskDescription").value = task?.description || "";
  $("#taskPriority").value = task?.priority || "Medium";
  $("#taskDueDate").value = task?.dueDate || "";
  taskDialog.showModal();
  $("#taskTitle").focus();
}
function closeTaskDialog() {
  taskDialog.close();
  editingId = null;
  $("#taskForm").reset();
}
$("#openAddBtn").addEventListener("click", () => openTaskDialog());
$("#emptyAddBtn").addEventListener("click", () => openTaskDialog());
$("#closeDialogBtn").addEventListener("click", closeTaskDialog);
$("#cancelDialogBtn").addEventListener("click", closeTaskDialog);
taskDialog.addEventListener("click", (event) => {
  if (event.target === taskDialog) closeTaskDialog();
});
$("#taskForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const title = $("#taskTitle").value.trim();
  if (!title) return;
  const taskData = {
    title,
    description: $("#taskDescription").value.trim(),
    priority: $("#taskPriority").value,
    dueDate: $("#taskDueDate").value
  };
  if (editingId) {
    tasks = tasks.map((task) => task.id === editingId ? { ...task, ...taskData } : task);
    showToast("Task updated successfully.");
  } else {
    tasks.unshift({ id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, ...taskData, completed: false, createdAt: Date.now() });
    showToast("Task created successfully.");
  }
  saveTasks();
  renderTasks();
  closeTaskDialog();
});
taskList.addEventListener("click", (event) => {
  const actionElement = event.target.closest("[data-action]");
  if (!actionElement) return;
  const card = actionElement.closest("[data-id]");
  const task = tasks.find((item) => item.id === card?.dataset.id);
  if (!task) return;
  const action = actionElement.dataset.action;
  if (action === "edit") openTaskDialog(task);
  if (action === "delete") {
    if (!confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    tasks = tasks.filter((item) => item.id !== task.id);
    saveTasks();
    renderTasks();
    showToast("Task deleted.");
  }
});
taskList.addEventListener("change", (event) => {
  if (event.target.dataset.action !== "toggle") return;
  const id = event.target.closest("[data-id]")?.dataset.id;
  tasks = tasks.map((task) => task.id === id ? { ...task, completed: event.target.checked } : task);
  saveTasks();
  renderTasks();
  showToast(event.target.checked ? "Task completed!" : "Task moved to in progress.");
});
document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => { currentFilter = button.dataset.filter; renderTasks(); });
});
$("#searchInput").addEventListener("input", renderTasks);
$("#priorityFilter").addEventListener("change", renderTasks);

function loadProfile() {
  const name = localStorage.getItem(STORAGE_KEYS.user);
  if (name) {
    $("#profileName").textContent = name;
    $(".profile-avatar").textContent = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  } else {
    loginDialog.showModal();
  }
}
$("#loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("#userName").value.trim();
  if (!name) return;
  localStorage.setItem(STORAGE_KEYS.user, name);
  $("#profileName").textContent = name;
  $(".profile-avatar").textContent = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  loginDialog.close();
  showToast(`Welcome, ${name}!`);
});
$("#signOutBtn").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEYS.user);
  $("#userName").value = "";
  loginDialog.showModal();
});
$("#todayLabel").textContent = new Date().toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
renderTasks();
loadProfile();
