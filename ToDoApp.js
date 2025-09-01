const inp = document.getElementById("listInput");
const addTask = document.getElementById("addT");
const clearTask = document.getElementById("clearT");
const tasklistul = document.getElementById("tasklist");
const allcomplete = document.getElementById("completeT");
const taskCounter = document.getElementById("taskCounter");
const filterAll = document.getElementById("alltsk");
const filterCompleted = document.getElementById("completedtsk");
const filterPending = document.getElementById("pendingtsk");
const searchInput = document.getElementById("searchTask");
const dueInput = document.getElementById("dueDate");

const storageKey = "tasksStored";

// ===== Counter =====
function updateCounter() {
    const total = tasklistul.querySelectorAll("li").length;
    const completed = tasklistul.querySelectorAll("li .completed").length;
    const pending = total - completed;
    taskCounter.textContent =
        `Total: ${total}, Completed: ${completed}, Pending: ${pending}`;
}

// ===== Highlight Overdue =====
function highlightOverdue(li, due) {
    if (!due) return;
    const now = new Date();
    const dueDate = new Date(due);
    const span = li.querySelector("span:first-child");

    if (now > dueDate && !span.classList.contains("completed")) {
        li.style.color = "red";
    } else {
        li.style.color = "black";
    }
}

// ===== Save tasks in LocalStorage =====
function saveTasks() {
    const tasksArray = [];
    tasklistul.querySelectorAll("li").forEach(li => {
        const span = li.querySelector("span:first-child");
        if (!span) return;
        tasksArray.push({
            text: span.textContent,
            completed: span.classList.contains("completed"),
            due: li.querySelector(".dueDate")?.textContent.replace("⏰ ", "") || ""
        });
    });
    localStorage.setItem(storageKey, JSON.stringify(tasksArray));
}

// ===== Create li =====
function createTaskElement(text, completed = false, due = "") {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.style.cursor = "pointer";
    span.textContent = text;
    if (completed) span.classList.add("completed");

    // Complete toggle
    span.addEventListener("click", () => {
        span.classList.toggle("completed");
        highlightOverdue(li, due);
        updateCounter();
        saveTasks();
    });

    // Due date span
    const dueSpan = document.createElement("span");
    dueSpan.textContent = due ? `⏰ ${due}` : "";
    dueSpan.classList.add("dueDate");
    dueSpan.style.marginLeft = "10px";

    highlightOverdue(li, due);

    // Edit button
    const edtbtn = document.createElement("button");
    edtbtn.textContent = "✏️";
    edtbtn.addEventListener("click", function () {
        const inpt = document.createElement("input");
        inpt.type = "text";
        inpt.value = span.textContent;

        li.replaceChild(inpt, span);
        inpt.focus();

        let saved = false;
        function save() {
            if (saved) return;
            saved = true;
            span.textContent = inpt.value.trim() || "Untitled Task";
            if (li.contains(inpt)) li.replaceChild(span, inpt);
            updateCounter();
            saveTasks();
        }
        function cancel() {
            if (saved) return;
            saved = true;
            if (li.contains(inpt)) li.replaceChild(span, inpt);
        }

        inpt.addEventListener("keydown", function (e) {
            if (e.key === "Enter") save();
            else if (e.key === "Escape") cancel();
        });
        inpt.addEventListener("blur", save);
    });

    // Delete button
    const deletbtn = document.createElement("button");
    deletbtn.textContent = "❌";
    deletbtn.addEventListener("click", function () {
        li.remove();
        updateCounter();
        saveTasks();
    });

    li.append(span, dueSpan, edtbtn, deletbtn);
    return li;
}

// ===== Load tasks =====
function loadTasks() {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const tasks = JSON.parse(raw);
    tasks.forEach(t => {
        const li = createTaskElement(t.text, t.completed, t.due);
        tasklistul.appendChild(li);
    });
    updateCounter();
}

// ===== Add New Task =====
addTask.addEventListener("click", function () {
    const valueText = inp.value.trim();
    const due = dueInput.value;
    if (!valueText) {
        alert("The Task Can't be Empty");
        return;
    }
    const li = createTaskElement(valueText, false, due);
    tasklistul.appendChild(li);

    inp.value = "";
    dueInput.value = "";
    updateCounter();
    saveTasks();
});

// Enter key adds task
inp.addEventListener("keypress", function (e) {
    if (e.key === "Enter") addTask.click();
});

// Clear All
clearTask.addEventListener("click", function () {
    tasklistul.innerHTML = "";
    updateCounter();
    saveTasks();
});

// All Done toggle
allcomplete.addEventListener("click", function () {
    const spans = tasklistul.querySelectorAll("li span:first-child");
    const allDone = Array.from(spans).every(s => s.classList.contains("completed"));
    spans.forEach(task => {
        task.classList.toggle("completed", !allDone);
    });
    updateCounter();
    saveTasks();
});

// Filters
filterAll.addEventListener("click", function () {
    tasklistul.querySelectorAll("li").forEach(li => li.style.display = "");
});
filterCompleted.addEventListener("click", function () {
    tasklistul.querySelectorAll("li").forEach(li => {
        const span = li.querySelector("span:first-child");
        li.style.display = span.classList.contains("completed") ? "" : "none";
    });
});
filterPending.addEventListener("click", function () {
    tasklistul.querySelectorAll("li").forEach(li => {
        const span = li.querySelector("span:first-child");
        li.style.display = span.classList.contains("completed") ? "none" : "";
    });
});

// Search
searchInput.addEventListener("input", function () {
    const query = searchInput.value.toLowerCase();
    tasklistul.querySelectorAll("li").forEach(li => {
        const span = li.querySelector("span:first-child");
        const text = span.textContent.toLowerCase();
        li.style.display = text.includes(query) ? "" : "none";
    });
});

// Initial load
loadTasks();
