
function load() {
    try {
        const data = JSON.parse(localStorage.getItem("tasks"));

        return Array.isArray(data) ? data : [];

    } catch (error) {
        return [];
    }
}

let tasks = load();

let currentFilter = "all";

// HTML Elements
const form = document.getElementById("form");
const input = document.getElementById("text");
const priorityInput = document.getElementById("priority");
const categoryInput = document.getElementById("taskCategory");
const dueDateInput = document.getElementById("dueDate");
const list = document.getElementById("list");
const count = document.getElementById("count");
const search = document.getElementById("search");
const categoryFilter = document.getElementById("categoryFilter");
const sortTasks = document.getElementById("sortTasks");
const themeToggle = document.getElementById("themeToggle");
const clearCompleted = document.getElementById("clearCompleted");


// SAVE TASKS
function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


// UPDATE DASHBOARD
function updateDashboard() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.done
    ).length;

    const pending = total - completed;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("totalCount").textContent = total;

    document.getElementById("completedCount").textContent = completed;

    document.getElementById("pendingCount").textContent = pending;

    document.getElementById("progressText").textContent =
        percentage + "%";

    document.getElementById("progressBar").style.width =
        percentage + "%";
}

function render() {

    list.replaceChildren();

    const searchText = search.value.toLowerCase().trim();

    const filteredTasks = tasks.filter(task => {

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "active" && !task.done) ||
            (currentFilter === "done" && task.done);

const matchesSearch =
    task.text.toLowerCase().includes(searchText);

const selectedCategory = categoryFilter.value;

const matchesCategory =
    selectedCategory === "all" ||
    task.category === selectedCategory;

return matchesFilter && matchesSearch && matchesCategory;

    });

    // SORT TASKS
const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3
};

if (sortTasks.value === "priority") {

    filteredTasks.sort((a, b) =>
        (priorityOrder[a.priority.toLowerCase()] || 4) -
        (priorityOrder[b.priority.toLowerCase()] || 4)
    );

} else if (sortTasks.value === "date") {

    filteredTasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
    });

} else if (sortTasks.value === "name") {

    filteredTasks.sort((a, b) =>
        a.text.localeCompare(b.text)
    );

}

    if (filteredTasks.length === 0) {

        const empty = document.createElement("li");

        empty.className = "empty-message";

        empty.textContent = "No tasks found. Add a new task!";

        list.appendChild(empty);
    }


    // Create task items
    filteredTasks.forEach(task => {

        const li = document.createElement("li");

        li.dataset.id = String(task.id);

        if (task.done) {
            li.classList.add("done");
        }


        // Task information
        const info = document.createElement("div");

        info.className = "task-info";

        const taskName = document.createElement("span");

        taskName.textContent = task.text;

        const categoryLabel = document.createElement("small");

categoryLabel.className = "task-category";

categoryLabel.textContent = task.category || "Uncategorized";

       const details = document.createElement("small");

details.textContent = task.dueDate
    ? "Due: " + task.dueDate
    : "No due date";


// TASK DEADLINE STATUS
const deadlineStatus = document.createElement("small");

deadlineStatus.className = "deadline-status";

if (task.dueDate && !task.done) {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(task.dueDate + "T00:00:00");

    if (dueDate < today) {
        deadlineStatus.textContent = "Overdue";
        deadlineStatus.classList.add("overdue");

    } else if (dueDate.getTime() === today.getTime()) {
        deadlineStatus.textContent = "Due Today";
        deadlineStatus.classList.add("due-today");

    } else {
        deadlineStatus.textContent = "Upcoming";
        deadlineStatus.classList.add("upcoming");
    }

} else if (task.done) {

    deadlineStatus.textContent = "Completed";
    deadlineStatus.classList.add("upcoming");

} else {

    deadlineStatus.textContent = "No deadline";

}


// Display task information
info.append(taskName, categoryLabel, details, deadlineStatus);

        // Priority
        const badge = document.createElement("span");

        badge.className =
            "priority " + (task.priority || "Medium");

        badge.textContent = task.priority || "Medium";


        // Action buttons
        const actions = document.createElement("div");

        actions.className = "task-actions";


        const toggle = document.createElement("button");

        toggle.type = "button";

        toggle.dataset.action = "toggle";

        toggle.textContent = task.done ? "Undo" : "Done";


        const edit = document.createElement("button");

        edit.type = "button";

        edit.dataset.action = "edit";

        edit.textContent = "Edit";


        const del = document.createElement("button");

        del.type = "button";

        del.dataset.action = "delete";

        del.className = "delete-btn";

        del.textContent = "Delete";


        actions.append(toggle, edit, del);

        li.append(info, badge, actions);

        list.appendChild(li);

    });


    // Remaining tasks
    const remaining = tasks.filter(
        task => !task.done
    ).length;

    count.textContent = remaining + " tasks remaining";


    // Filter button status
    document.querySelectorAll(".filter").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.filter === currentFilter
        );

    });

    updateDashboard();
    updateAnalytics();
    updateUpcomingTasks();



}


// ADD TASK
form.addEventListener("submit", function(event) {

    event.preventDefault();

    const taskText = input.value.trim();

    if (!taskText) {
        input.focus();
        return;
    }

    tasks.push({

        id: Date.now() + Math.random(),

        text: taskText,

        priority: priorityInput.value,

        category: categoryInput.value,

        dueDate: dueDateInput.value,

        done: false

    });

    input.value = "";

    dueDateInput.value = "";

    save();

    render();

    input.focus();

});


// COMPLETE, EDIT AND DELETE
list.addEventListener("click", function(event) {

    const action = event.target.dataset.action;

    if (!action) return;

    const li = event.target.closest("li");

    if (!li) return;

    const id = li.dataset.id;

    const task = tasks.find(
        item => String(item.id) === id
    );

    if (!task) return;


    if (action === "toggle") {

    task.done = !task.done;

    if (task.done) {
        task.completedAt = new Date().toISOString();
    } else {
        delete task.completedAt;
    }

}


    if (action === "delete") {

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    tasks = tasks.filter(
        item => String(item.id) !== id
    );

}

    if (action === "edit") {

        const updatedText = prompt(
            "Edit your task:",
            task.text
        );

        if (updatedText === null) return;

        if (!updatedText.trim()) {

            alert("Task cannot be empty!");

            return;
        }

        task.text = updatedText.trim();

    }


    save();

    render();

});


// FILTER TASKS
document.querySelectorAll(".filter").forEach(button => {

    button.addEventListener("click", function() {

        currentFilter = button.dataset.filter;

        render();

    });

});


// SEARCH TASKS
search.addEventListener("input", render);


// CLEAR COMPLETED TASKS
clearCompleted.addEventListener("click", function() {

    tasks = tasks.filter(
        task => !task.done
    );

    save();

    render();

});


// DARK AND LIGHT MODE
function updateThemeButton() {

    themeToggle.textContent =
        document.body.classList.contains("light")
            ? "☾ Dark Mode"
            : "☀ Light Mode";

}


// Load saved theme
const savedTheme = localStorage.getItem("taskflow-theme");

if (savedTheme === "light") {

    document.body.classList.add("light");

}


// Change theme
themeToggle.addEventListener("click", function() {

    document.body.classList.toggle("light");

    const theme = document.body.classList.contains("light")
        ? "light"
        : "dark";

    localStorage.setItem("taskflow-theme", theme);

    updateThemeButton();

});

updateThemeButton();

render();

const calendarDays = document.getElementById("calendarDays");
const monthYear = document.getElementById("monthYear");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");
const selectedDateTasks = document.getElementById("selectedDateTasks");

let calendarDate = new Date();
let selectedDate = getLocalDateString(new Date());


// Format date as YYYY-MM-DD using local date
function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// Display calendar
function renderCalendar() {

    calendarDays.replaceChildren();

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    monthYear.textContent = calendarDate.toLocaleDateString(
        "en-US",
        {
            month: "long",
            year: "numeric"
        }
    );

    const firstDay = new Date(year, month, 1).getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();


    // Empty spaces before first day
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.className = "calendar-empty";
        calendarDays.appendChild(empty);
    }


    // Create calendar dates
    for (let day = 1; day <= daysInMonth; day++) {

        const date = new Date(year, month, day);
        const dateString = getLocalDateString(date);

        const button = document.createElement("button");

        button.type = "button";
        button.className = "calendar-day";
        button.textContent = day;

        if (dateString === getLocalDateString(new Date())) {
            button.classList.add("today");
        }

        if (dateString === selectedDate) {
            button.classList.add("selected");
        }

        // Show indicator if tasks exist on this date
        const hasTasks = tasks.some(
            task => task.dueDate === dateString
        );

        if (hasTasks) {
            button.classList.add("has-task");
            button.title = "Tasks scheduled";
        }

        button.addEventListener("click", function() {

            selectedDate = dateString;

            renderCalendar();
            showSelectedDateTasks();

        });

        calendarDays.appendChild(button);
    }

    showSelectedDateTasks();
}


// Show tasks for selected date
function showSelectedDateTasks() {

    selectedDateTasks.replaceChildren();

    const heading = document.createElement("h3");

    heading.textContent = "Tasks for " + selectedDate;

    selectedDateTasks.appendChild(heading);

    const dateTasks = tasks.filter(
        task => task.dueDate === selectedDate
    );

    if (dateTasks.length === 0) {

        const message = document.createElement("p");

        message.textContent = "No tasks scheduled for this date.";

        selectedDateTasks.appendChild(message);

        return;
    }

    dateTasks.forEach(task => {

        const item = document.createElement("div");

        item.className = "calendar-task";

        const name = document.createElement("span");

        name.textContent = task.text;

        const status = document.createElement("small");

        status.textContent = task.done
            ? "Completed"
            : "Pending";

        item.append(name, status);

        selectedDateTasks.appendChild(item);

    });
}


// Previous month
prevMonth.addEventListener("click", function() {

    calendarDate.setMonth(calendarDate.getMonth() - 1);

    renderCalendar();

});


// Next month
nextMonth.addEventListener("click", function() {

    calendarDate.setMonth(calendarDate.getMonth() + 1);

    renderCalendar();

});


// Refresh calendar whenever task list changes
const originalRender = render;

render = function() {

    originalRender();

    renderCalendar();

};
// Initial calendar
renderCalendar();
// CATEGORY FILTER
categoryFilter.addEventListener("change", function() {
    render();
});

// SORT TASKS EVENT
sortTasks.addEventListener("change", function() {
    render();
});

// MOBILE SIDEBAR MENU
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const closeMenuBtn = document.getElementById("closeMenuBtn");
const sidebar = document.querySelector(".sidebar");
const menuOverlay = document.getElementById("menuOverlay");

function openMobileMenu() {
    sidebar.classList.add("mobile-open");
    menuOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
    mobileMenuBtn.classList.add("menu-hidden");
}

function closeMobileMenu() {
    sidebar.classList.remove("mobile-open");
    menuOverlay.classList.remove("active");
    document.body.style.overflow = "";
    mobileMenuBtn.classList.remove("menu-hidden");
}

mobileMenuBtn.addEventListener("click", openMobileMenu);

closeMenuBtn.addEventListener("click", closeMobileMenu);

menuOverlay.addEventListener("click", closeMobileMenu);

// Close menu after selecting a navigation link
document.querySelectorAll(".sidebar .nav-link").forEach(link => {
    link.addEventListener("click", closeMobileMenu);
});

// Close menu using Escape key
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeMobileMenu();
    }
});

// NOTIFICATION PANEL TOGGLE
const notificationBtn = document.getElementById("notificationBtn");
const notificationPanel = document.getElementById("notificationPanel");

notificationBtn.addEventListener("click", function () {
    notificationPanel.hidden = !notificationPanel.hidden;
});

// Close panel when clicking outside
document.addEventListener("click", function (event) {
    if (
        !notificationPanel.contains(event.target) &&
        !notificationBtn.contains(event.target)
    ) {
        notificationPanel.hidden = true;
    }
});

// TASKFLOW NOTIFICATION SYSTEM

const notificationList = document.getElementById("notificationList");
const notificationCount = document.getElementById("notificationCount");
const clearNotifications = document.getElementById("clearNotifications");

function getSavedNotificationIds(key) {
    try {
        const saved = JSON.parse(localStorage.getItem(key));
        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        return [];
    }
}

let readNotifications = getSavedNotificationIds("taskflow-read-notifications");
let dismissedNotifications = getSavedNotificationIds("taskflow-dismissed-notifications");

function getTaskNotifications() {
    const today = new Date();
    const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    let notifications = [];

    tasks.forEach(task => {
        const taskId = String(task.id);

        if (task.done) {
            notifications.push({
                id: "completed-" + taskId,
                title: "Task Completed",
                message: task.text,
                type: "Completed"
            });
        } else if (task.dueDate && task.dueDate < todayString) {
            notifications.push({
                id: "overdue-" + taskId,
                title: "Overdue Task",
                message: task.text,
                type: "Overdue"
            });
        } else if (task.dueDate === todayString) {
            notifications.push({
                id: "today-" + taskId,
                title: "Due Today",
                message: task.text,
                type: "Due Today"
            });
        }
    });

    return notifications;
}

function renderNotifications() {
    const notifications = getTaskNotifications();

    const visibleNotifications = notifications.filter(notification =>
        !dismissedNotifications.includes(notification.id)
    );

    const unreadCount = visibleNotifications.filter(notification =>
        !readNotifications.includes(notification.id)
    ).length;

    notificationCount.textContent = unreadCount;
    notificationList.textContent = "";

    if (visibleNotifications.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-notifications";
        emptyMessage.textContent = "You're all caught up!";
        notificationList.appendChild(emptyMessage);
        return;
    }

    visibleNotifications.forEach(notification => {
        const item = document.createElement("div");
        item.className = "notification-item";

        const heading = document.createElement("strong");
        heading.textContent = notification.title;

        const message = document.createElement("p");
        message.textContent = notification.message;

        const markReadBtn = document.createElement("button");
        markReadBtn.type = "button";

        const isRead = readNotifications.includes(notification.id);
        markReadBtn.textContent = isRead ? "Read" : "Mark as Read";
        markReadBtn.disabled = isRead;

        markReadBtn.addEventListener("click", function () {
            if (!readNotifications.includes(notification.id)) {
                readNotifications.push(notification.id);
                localStorage.setItem(
                    "taskflow-read-notifications",
                    JSON.stringify(readNotifications)
                );
                renderNotifications();
            }
        });

        item.appendChild(heading);
        item.appendChild(message);
        item.appendChild(markReadBtn);
        notificationList.appendChild(item);
    });
}

// Refresh notifications when the bell is clicked
notificationBtn.addEventListener("click", renderNotifications);

// Clear all notifications
clearNotifications.addEventListener("click", function () {
    const notifications = getTaskNotifications();

    notifications.forEach(notification => {
        if (!dismissedNotifications.includes(notification.id)) {
            dismissedNotifications.push(notification.id);
        }
    });

    localStorage.setItem(
        "taskflow-dismissed-notifications",
        JSON.stringify(dismissedNotifications)
    );

    renderNotifications();
});

// Initial notification count
renderNotifications();

// PRODUCTIVITY ANALYTICS

function updateAnalytics() {

    const total = tasks.length;

    const completed = tasks.filter(task => task.done).length;

    const pending = total - completed;

    const rate = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    const high = tasks.filter(task =>
        task.priority.toLowerCase() === "high"
    ).length;

    const medium = tasks.filter(task =>
        task.priority.toLowerCase() === "medium"
    ).length;

    const low = tasks.filter(task =>
        task.priority.toLowerCase() === "low"
    ).length;

    document.getElementById("analyticsTotal").textContent = total;
    document.getElementById("analyticsCompleted").textContent = completed;
    document.getElementById("analyticsPending").textContent = pending;
    document.getElementById("analyticsRate").textContent = rate + "%";
    document.getElementById("analyticsProgressBar").style.width = rate + "%";
    document.getElementById("analyticsProgressText").textContent = rate + "% Completed";
    document.getElementById("highPriorityCount").textContent = high;
    document.getElementById("mediumPriorityCount").textContent = medium;
    document.getElementById("lowPriorityCount").textContent = low;

// WEEKLY PRODUCTIVITY CHART

const weeklyChart = document.getElementById("weeklyChart");

weeklyChart.replaceChildren();

const today = new Date();
today.setHours(0, 0, 0, 0);

const lastSevenDays = [];

for (let i = 6; i >= 0; i--) {

    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const dateKey = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");

    const completedCount = tasks.filter(task => {

        if (!task.completedAt) return false;

        const completedDate = new Date(task.completedAt);

        const completedKey = [
            completedDate.getFullYear(),
            String(completedDate.getMonth() + 1).padStart(2, "0"),
            String(completedDate.getDate()).padStart(2, "0")
        ].join("-");

        return completedKey === dateKey;

    }).length;

    lastSevenDays.push({
        day: date.toLocaleDateString("en-US", {
            weekday: "short"
        }),
        count: completedCount
    });
}

const maxCount = Math.max(
    1,
    ...lastSevenDays.map(day => day.count)
);

lastSevenDays.forEach(day => {

    const dayColumn = document.createElement("div");
    dayColumn.className = "chart-day";

    const count = document.createElement("strong");
    count.textContent = day.count;

    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.height =
        Math.max(4, (day.count / maxCount) * 100) + "%";

    const label = document.createElement("span");
    label.textContent = day.day;

    dayColumn.append(count, bar, label);
    weeklyChart.appendChild(dayColumn);

});
}

updateAnalytics();

// EXPORT TASKS AS CSV

const exportTasksBtn = document.getElementById("exportTasks");

exportTasksBtn.addEventListener("click", function () {

    if (tasks.length === 0) {
        alert("No tasks available to export!");
        return;
    }

    const headers = [
        "Task",
        "Priority",
        "Category",
        "Due Date",
        "Status",
        "Completed At"
    ];

    const rows = tasks.map(task => [
        task.text,
        task.priority,
        task.category,
        task.dueDate || "No Due Date",
        task.done ? "Completed" : "Pending",
        task.completedAt || "Not Completed"
    ]);

    function escapeCSV(value) {
        return `"${String(value ?? "").replace(/"/g, '""')}"`;
    }

    const csvContent = [
        headers.map(escapeCSV).join(","),
        ...rows.map(row => row.map(escapeCSV).join(","))
    ].join("\r\n");

    const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "TaskFlow_Tasks.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    alert("Tasks exported successfully!");
});
// SETTINGS THEME TOGGLE

const settingsThemeToggle =
    document.getElementById("settingsThemeToggle");

settingsThemeToggle.addEventListener("click", function () {

    document.getElementById("themeToggle").click();

});

// DEFAULT PRIORITY SETTINGS

const defaultPrioritySetting =
    document.getElementById("defaultPriority");

const savedPriority =
    localStorage.getItem("taskflow-default-priority");

if (savedPriority) {
    defaultPrioritySetting.value = savedPriority;
    priorityInput.value = savedPriority;
}

defaultPrioritySetting.addEventListener("change", function () {

    const selectedPriority = defaultPrioritySetting.value;

    localStorage.setItem(
        "taskflow-default-priority",
        selectedPriority
    );

    priorityInput.value = selectedPriority;

});
// USER PROFILE SETTINGS

const profileNameInput =
    document.getElementById("profileName");

const saveProfileBtn =
    document.getElementById("saveProfile");

const profileMessage =
    document.getElementById("profileMessage");

// Load saved profile
const savedProfileName =
    localStorage.getItem("taskflow-profile-name");

if (savedProfileName) {
    profileNameInput.value = savedProfileName;
}

// Save profile
saveProfileBtn.addEventListener("click", function () {

    const name = profileNameInput.value.trim();

    if (!name) {
        profileMessage.textContent = "Please enter your name.";
        profileMessage.style.color = "#ff9999";
        return;
    }

    localStorage.setItem("taskflow-profile-name", name);
    updateDashboardUserName();
    profileMessage.textContent = "Profile saved successfully!";
    profileMessage.style.color = "#5EA3A3";

});
// EXPORT TASKFLOW BACKUP

const backupTasksBtn = document.getElementById("backupTasks");

backupTasksBtn.addEventListener("click", function () {

    if (tasks.length === 0) {
        alert("No tasks available to back up!");
        return;
    }

    const backupData = {
        app: "TaskFlow",
        version: "1.0",
        exportedAt: new Date().toISOString(),
        tasks: tasks
    };

    const backupBlob = new Blob(
        [JSON.stringify(backupData, null, 4)],
        { type: "application/json" }
    );

    const backupUrl = URL.createObjectURL(backupBlob);

    const backupLink = document.createElement("a");
    backupLink.href = backupUrl;
    backupLink.download = "TaskFlow_Backup.json";

    document.body.appendChild(backupLink);
    backupLink.click();
    backupLink.remove();

    URL.revokeObjectURL(backupUrl);

    alert("Backup downloaded successfully!");
});
// IMPORT TASKFLOW BACKUP

const importBackupInput = document.getElementById("importBackup");

importBackupInput.addEventListener("change", function (event) {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function () {

        try {
            const backupData = JSON.parse(reader.result);

            if (
                backupData.app !== "TaskFlow" ||
                !Array.isArray(backupData.tasks)
            ) {
                alert("Invalid TaskFlow backup file!");
                return;
            }

            const isValid = backupData.tasks.every(task =>
                task &&
                typeof task.id === "number" &&
                typeof task.text === "string" &&
                typeof task.priority === "string" &&
                typeof task.category === "string" &&
                typeof task.done === "boolean"
            );

            if (!isValid) {
                alert("Backup file contains invalid task data!");
                return;
            }

            const confirmRestore = confirm(
                "Importing will replace your current tasks. Continue?"
            );

            if (!confirmRestore) return;

            tasks = backupData.tasks;

            localStorage.setItem("tasks", JSON.stringify(tasks));

            render();

            alert("Tasks restored successfully!");

        } catch (error) {
            alert("Unable to read backup file!");
        }

        importBackupInput.value = "";
    };

    reader.readAsText(file);
});
// DISPLAY PROFILE NAME ON DASHBOARD

const dashboardUserName =
    document.getElementById("dashboardUserName");

function updateDashboardUserName() {

    const savedName =
        localStorage.getItem("taskflow-profile-name");

    dashboardUserName.textContent = savedName || "User";

    const currentHour = new Date().getHours();

    let greeting = "Welcome";

    if (currentHour < 12) {
        greeting = "Good Morning";
    } else if (currentHour < 17) {
        greeting = "Good Afternoon";
    } else {
        greeting = "Good Evening";
    }

    document.getElementById("dashboardGreeting").textContent = greeting;
}

updateDashboardUserName();
// UPCOMING TASKS ON DASHBOARD

function updateUpcomingTasks() {

    const upcomingList =
        document.getElementById("upcomingTasksList");

    upcomingList.replaceChildren();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    const upcomingTasks = tasks
        .filter(task =>
            !task.done &&
            task.dueDate &&
            task.dueDate >= todayString
        )
        .sort((a, b) =>
            a.dueDate.localeCompare(b.dueDate)
        )
        .slice(0, 5);

    if (upcomingTasks.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No upcoming tasks.";
        upcomingList.appendChild(message);
        return;
    }

    upcomingTasks.forEach(task => {

        const item = document.createElement("div");
        item.className = "upcoming-task-item";

        const taskName = document.createElement("strong");
        taskName.textContent = task.text;

        const dueDate = document.createElement("span");
        dueDate.textContent = "Due: " + task.dueDate;

        item.append(taskName, dueDate);
        upcomingList.appendChild(item);

    });
}
// TASKFLOW PAGE NAVIGATION

const pageLinks = document.querySelectorAll(".sidebar .nav-link");

const pages = document.querySelectorAll(
    ".main-content > section"
);

function showPage(pageId) {

    // Hide all pages
    pages.forEach(page => {
        page.classList.remove("active-page");
    });

    // Show selected page
    const selectedPage = document.getElementById(pageId);

    if (!selectedPage) return;

    selectedPage.classList.add("active-page");

    // Update sidebar active link
    pageLinks.forEach(link => {
        link.classList.remove("selected");

        if (link.getAttribute("href") === "#" + pageId) {
            link.classList.add("selected");
        }
    });
}

// Dashboard is the default page
showPage("dashboard");

// Handle sidebar clicks
pageLinks.forEach(link => {

    link.addEventListener("click", function(event) {

        event.preventDefault();

        const pageId = this.getAttribute("href").substring(1);

        showPage(pageId);

    });

});