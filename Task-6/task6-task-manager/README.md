# TaskFlow — Task Manager Capstone

A responsive task management web application built with **HTML, CSS, and vanilla JavaScript**.

## Features

- Demo sign-in with a locally stored display name
- Create, read, update, and delete tasks
- Mark tasks as completed or in progress
- Search by task title or description
- Filter by task status and priority
- Due dates and task statistics
- Persistent task data with browser `localStorage`
- Responsive layout and keyboard-visible focus styles
- No external libraries or build step required

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. Enter a display name and create your first task.

For a more realistic local web-server experience, use VS Code Live Server or run `python -m http.server 8000` from the project folder, then visit `http://localhost:8000`.

## Project structure

```text
task6-task-manager/
├── index.html
├── style.css
├── app.js
├── README.md
└── .gitignore
```

## Architecture

```text
index.html
    │
    ├── style.css  → responsive layout, visual states, accessibility focus
    │
    └── app.js     → UI events, filtering, CRUD operations
            │
            └── browser localStorage → tasks and demo display name
```

## Important security note

The sign-in screen is a **demo only**. It stores a display name in the current browser and does not authenticate a real account or protect private data. This static frontend does not use a backend API. Do not enter passwords or sensitive information.

## Deployment

This project can be published as a static website with GitHub Pages, Netlify, or Vercel. For GitHub Pages, open the repository's **Settings → Pages**, select **Deploy from a branch**, choose the `main` branch and `/ (root)` folder, then save. Wait for the deployment URL to appear in the Pages section.

## Testing checklist

- [ ] Add a task with title, priority, and due date
- [ ] Edit the task
- [ ] Mark it complete and then incomplete
- [ ] Search for it and filter by priority
- [ ] Delete it
- [ ] Refresh the page and confirm remaining tasks persist
- [ ] Test the layout at mobile and desktop widths

## Technologies

HTML5 · CSS3 · JavaScript ES6+ · DOM API · localStorage
