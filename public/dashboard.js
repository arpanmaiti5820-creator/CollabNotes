const token = localStorage.getItem("token");
const currentUser = JSON.parse(localStorage.getItem("user"));

if (!currentUser) {
    window.location.href = "index.html";
}

const userName = currentUser.name || "User";
const firstLetter = userName.charAt(0).toUpperCase();

const welcomeUserName = document.getElementById("welcomeUserName");
const sidebarUserName = document.getElementById("sidebarUserName");
const userAvatar = document.getElementById("userAvatar");
const topAvatar = document.getElementById("topAvatar");

if (welcomeUserName) {
    welcomeUserName.textContent = userName;
}

if (sidebarUserName) {
    sidebarUserName.textContent = userName;
}

if (userAvatar) {
    userAvatar.textContent = firstLetter;
}

if (topAvatar) {
    topAvatar.textContent = firstLetter;
}
if (!token) {
  window.location.href = "/";
}

function getSelectedVisibility() {
  return (
    document.querySelector('input[name="visibility"]:checked')?.value ||
    "private"
  );
}

let notes = [];
let editingNoteId = null;

let originalNoteData = null;
let currentNoteView = "all";
// ==============================
// DOM elements
// ==============================
const noteFile = document.getElementById("noteFile");
const filePreview = document.getElementById("filePreview");
const notesGrid = document.getElementById("notesGrid");

const totalNotes = document.getElementById("totalNotes");
const favoriteNotes = document.getElementById("favoriteNotes");
const folderCount = document.getElementById("folderCount");
const sharedNotes = document.getElementById("sharedNotes");

const allNotesBtn = document.getElementById("allNotesBtn");
const myNotesBtn = document.getElementById("myNotesBtn");
const favoritesBtn = document.getElementById("favoritesBtn");

const searchInput = document.getElementById("searchInput");
const searchBox = document.querySelector(".search-box");
const searchIcon = searchBox?.querySelector("span");

if (searchIcon) {
  searchIcon.addEventListener("click", (event) => {
    if (window.innerWidth <= 700) {
      event.stopPropagation();

      searchBox.classList.toggle("mobile-search-open");

      if (searchBox.classList.contains("mobile-search-open")) {
      }
    }
  });
}
searchInput.addEventListener("blur", () => {
  if (window.innerWidth <= 700) {
    setTimeout(() => {
      if (
        !searchBox.contains(document.activeElement) &&
        searchInput.value.trim() === ""
      ) {
        searchBox.classList.remove("mobile-search-open");
      }
    }, 150);
  }
});
const clearSearchBtn = document.getElementById("clearSearchBtn");
const noteModal = document.getElementById("noteModal");

const noteForm = document.getElementById("noteForm");

const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const noteFolder = document.getElementById("noteFolder");

const modalTitle = document.getElementById("modalTitle");
const viewerModal = document.getElementById("viewerModal");

const viewerTitle = document.getElementById("viewerTitle");

const viewerVisibility = document.getElementById("viewerVisibility");

const viewerText = document.getElementById("viewerText");

const viewerFile = document.getElementById("viewerFile");

function setActiveNav(activeButton) {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.remove("active");
  });

  activeButton.classList.add("active");
}

// ==============================
// Mobile Sidebar
// ==============================

const menuToggle = document.getElementById("menuToggle");

const sidebar = document.querySelector(".sidebar");

menuToggle.addEventListener("click", (event) => {
  event.stopPropagation();

  sidebar.classList.toggle("open");
});

// Close sidebar when clicking outside

document.addEventListener("click", (event) => {
  if (
    sidebar.classList.contains("open") &&
    !sidebar.contains(event.target) &&
    !menuToggle.contains(event.target)
  ) {
    sidebar.classList.remove("open");
  }
});

// Close sidebar after selecting a menu item

sidebar.querySelectorAll(".nav-item, .new-folder").forEach((item) => {
  item.addEventListener("click", () => {
    sidebar.classList.remove("open");
  });
});

const navItem = document.querySelectorAll(".nav-links a");
const backToTop = document.querySelector("#backToTop");
const year = document.querySelector("#year");

// ==============================
// Toast Notifications
// ==============================

let toastTimer;

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");

  if (!toast) return;

  clearTimeout(toastTimer);

  toast.textContent = message;

  toast.className = `toast ${type} show`;

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// ==============================
// Notifications
// ==============================

const notificationBtn = document.getElementById("notificationBtn");

const notificationPanel = document.getElementById("notificationPanel");

const notificationList = document.getElementById("notificationList");

const notificationBadge = document.getElementById("notificationBadge");

const notificationCount = document.getElementById("notificationCount");

const clearNotificationsBtn = document.getElementById("clearNotificationsBtn");

const currentUserForNotifications = JSON.parse(
    localStorage.getItem("user")
);

const NOTIFICATION_KEY = currentUserForNotifications?.email
    ? `collabnotes_notifications_${currentUserForNotifications.email}`
    : "collabnotes_notifications";
// Get notifications
function getNotifications() {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATION_KEY)) || [];
  } catch (error) {
    return [];
  }
}

// Save notifications
function saveNotifications(notifications) {
  localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications));
}

// Add a notification
function addNotification(title, message, icon = "🔔") {
  const notifications = getNotifications();

  const notification = {
    id: Date.now(),
    title,
    message,
    icon,
    read: false,
    createdAt: new Date().toISOString(),
  };

  notifications.unshift(notification);

  // Keep only the latest 20 notifications
  saveNotifications(notifications.slice(0, 20));

  renderNotifications();
}

// Render notifications
function renderNotifications() {
  const notifications = getNotifications();

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  // Update badge
  if (unreadCount > 0) {
    notificationBadge.textContent = unreadCount > 9 ? "9+" : unreadCount;

    notificationBadge.classList.remove("hidden");
  } else {
    notificationBadge.classList.add("hidden");
  }

  // Update count text
  notificationCount.textContent = `${unreadCount} unread`;

  // Empty state
  if (notifications.length === 0) {
    notificationList.innerHTML = `
      <div class="notification-empty">

        <div class="notification-empty-icon">
          🔔
        </div>

        <strong>No notifications</strong>

        <p>
          You're all caught up.
        </p>

      </div>
    `;

    return;
  }

  // Render notifications
  notificationList.innerHTML = notifications
    .map((notification) => {
      return `
          <div
            class="notification-item ${notification.read ? "" : "unread"}"
            data-id="${notification.id}"
          >

            <div class="notification-item-icon">
              ${notification.icon}
            </div>

            <div class="notification-item-content">

              <strong>
                ${escapeHTML(notification.title)}
              </strong>

              <small>
                ${escapeHTML(notification.message)}
              </small>

            </div>

          </div>
        `;
    })
    .join("");

  // Click notification
  document.querySelectorAll(".notification-item").forEach((item) => {
    item.addEventListener("click", () => {
      const id = Number(item.dataset.id);

      markNotificationAsRead(id);
    });
  });
}

// Mark notification as read
function markNotificationAsRead(id) {
  const notifications = getNotifications();

  const notification = notifications.find((item) => item.id === id);

  if (notification) {
    notification.read = true;
  }

  saveNotifications(notifications);

  renderNotifications();
  notificationPanel.classList.add("hidden");
}

// Open / close notification panel
notificationBtn.addEventListener("click", (event) => {
  event.stopPropagation();

  notificationPanel.classList.toggle("hidden");
});
document.addEventListener("click", (event) => {
  if (
    !notificationPanel.contains(event.target) &&
    !notificationBtn.contains(event.target)
  ) {
    notificationPanel.classList.add("hidden");
  }
});

// Prevent panel click from closing it
notificationPanel.addEventListener("click", (event) => {
  event.stopPropagation();
});

// Clear all notifications
clearNotificationsBtn.addEventListener("click", () => {
  saveNotifications([]);

  renderNotifications();

  notificationPanel.classList.add("hidden");

  showToast("Notifications cleared.", "success");
});

// Initial notification
if (getNotifications().length === 0) {
  addNotification(
    "Welcome to CollabNotes",
    "Your notification center is ready.",
    "👋",
  );
} else {
  renderNotifications();
}
// ==============================
// Open note viewer
// ==============================
myNotesBtn.addEventListener("click", () => {
  currentNoteView = "mine";

  setActiveNav(myNotesBtn);

  document.getElementById("notesHeading").textContent = "My Notes";

  const currentUser = JSON.parse(localStorage.getItem("user"));

  if (!currentUser) {
    showToast("Please login first.", "error");
    return;
  }

  applyNoteFilters();
});
async function openNote(id) {
  try {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const response = await fetch(
      `/api/notes/${id}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const data = await response.json();

      throw new Error(data.message || "Could not open note.");
    }

    const note = await response.json();

    viewerTitle.textContent = note.title;

    viewerVisibility.textContent =
      note.visibility === "public" ? "🌐 Public" : "🔒 Private";

    viewerText.textContent = note.content || "";

    viewerFile.innerHTML = "";

    // No attachment
    if (!note.file) {
      viewerModal.classList.remove("hidden");
      return;
    }

    const file = note.file;

    const fileName = document.createElement("div");

    fileName.className = "file-name";

    fileName.textContent = `📎 ${file.name}`;

    viewerFile.appendChild(fileName);

    // Image
    if (file.type.startsWith("image/")) {
      const image = document.createElement("img");

      image.src = file.url;
      image.alt = file.name;

      viewerFile.appendChild(image);
    }

    // PDF
    else if (file.type === "application/pdf") {
      const pdf = document.createElement("iframe");

      pdf.src = file.url;
      pdf.title = file.name;

      viewerFile.appendChild(pdf);
    }

    viewerModal.classList.remove("hidden");
  } catch (error) {
    showToast(error.message, "error");
  }
}

noteFile.addEventListener("change", () => {
  const file = noteFile.files[0];

  filePreview.innerHTML = "";

  if (!file) return;

  if (file.type.startsWith("image/")) {
    const image = document.createElement("img");

    image.src = URL.createObjectURL(file);

    filePreview.appendChild(image);
  } else {
    filePreview.innerHTML = `
            <p>📄 ${escapeHTML(file.name)}</p>
        `;
  }
});
// ==============================
// Load notes
// ==============================

async function loadNotes() {
  try {
    notesGrid.innerHTML = `
            <div class="loading-notes">
                <div class="loading-spinner"></div>
                <span>Loading notes...</span>
            </div>
        `;

    const currentUser = JSON.parse(localStorage.getItem("user"));

    const email = currentUser?.email || "";

    const token = localStorage.getItem("token");

    const response = await fetch(
      `/api/notes?email=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid notes data received.");
    }

    notes = data;

    applyNoteFilters();
  } catch (error) {
    console.error("Could not load notes:", error);

    notesGrid.innerHTML = `
            <div class="notes-error">
                <div class="error-icon">⚠️</div>

                <h3>Couldn't load your notes</h3>

                <p>
                    Something went wrong while loading your notes.
                </p>

                <button
                    onclick="loadNotes()"
                    class="retry-btn"
                >
                    Try Again
                </button>
            </div>
        `;
  }
}
// ==============================
// Load folders
// ==============================

async function loadFolders() {
  try {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    if (!currentUser) return;

    const response = await fetch("/api/folders", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Could not load folders.");
    }

    const folders = await response.json();
    folderCount.textContent = folders.length;
    folders.forEach((folderData) => {
      const option = document.createElement("option");

      option.value = folderData.name;

      option.textContent = folderData.name;

      noteFolder.appendChild(option);
      const folder = document.createElement("button");

      folder.className = "nav-item folder-btn";

      folder.innerHTML = `
                <span>📁</span>
                ${escapeHTML(folderData.name)}
            `;

      folder.addEventListener("click", () => {
        currentNoteView = `folder:${folderData.name}`;

        setActiveNav(folder);

        document.getElementById("notesHeading").textContent = folderData.name;

        applyNoteFilters();
      });
      newFolderBtn.parentElement.insertBefore(folder, newFolderBtn);
    });
  } catch (error) {
    console.error("Could not load folders:", error);
  }
}
// ==============================
// Render notes
// ==============================
function isFavorite(note) {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  if (!currentUser) return false;

  return (
    Array.isArray(note.favoriteBy) &&
    note.favoriteBy.includes(currentUser.email)
  );
}

function renderNotes(notesToRender) {
  notesGrid.innerHTML = "";

  totalNotes.textContent = notes.length;

  favoriteNotes.textContent = notes.filter((note) => isFavorite(note)).length;

  sharedNotes.textContent = notes.filter(
    (note) => note.visibility === "public",
  ).length;

  if (notesToRender.length === 0) {
    const isFavoritesView = currentNoteView === "favorites";

    notesGrid.innerHTML = `
        <div class="empty-notes">

            <div class="empty-icon">
                ${isFavoritesView ? "⭐" : "📝"}
            </div>

            <h3>
                ${isFavoritesView ? "No favorite notes" : "No notes yet"}
            </h3>

            <p>
                ${isFavoritesView
        ? "Favorite a note to see it here."
        : "Start organizing your ideas by creating your first note."
      }
            </p>

            ${!isFavoritesView
        ? `
                        <button
                            class="empty-create-btn"
                            onclick="document.getElementById('createNoteBtn').click()"
                        >
                            + Create Your First Note
                        </button>
                    `
        : ""
      }

        </div>
    `;

    return;
  }

  notesToRender.forEach((note, index) => {
    const card = document.createElement("div");

    card.className = "note-card";
    card.style.animationDelay = `${index * 0.06}s`;
    card.innerHTML = `

            <div class="note-card-meta">

    <div class="note-folder">
        📁 ${escapeHTML(note.folder)}
    </div>

    <span class="visibility-badge ${note.visibility === "public" ? "public" : "private"}">
        ${note.visibility === "public" ? "🌐 Public" : "🔒 Private"}
    </span>

</div>

            <h3>
                ${escapeHTML(note.title)}
            </h3>

            <p>
                ${escapeHTML(note.content.substring(0, 100))}
                ${note.content.length > 100 ? "..." : ""}
            </p>

            <div class="note-footer">

                <span class="note-time">
                    Updated ${note.updatedAt}
                </span>

                <div class="note-actions">


                    <button
    onclick="openNote(${note.id})"
    title="Open Note"
    aria-label="Open Note"
>
    👁
</button>

<button
    class="favorite-btn ${isFavorite(note) ? "is-favorite" : ""}"
    onclick="toggleFavorite(${note.id})"
    title="${isFavorite(note) ? "Remove from favorites" : "Add to favorites"}"
    aria-label="${isFavorite(note) ? "Remove from favorites" : "Add to favorites"}"
>
    ${isFavorite(note) ? "★" : "☆"}
</button>
<button
    class="like-btn ${Array.isArray(note.likedBy) && note.likedBy.includes(JSON.parse(localStorage.getItem("user"))?.email) ? "liked" : ""}"
    onclick="toggleLike(${note.id})"
    title="${Array.isArray(note.likedBy) && note.likedBy.includes(JSON.parse(localStorage.getItem("user"))?.email) ? "Unlike" : "Like"}"
    aria-label="Like Note"
>
    ❤️ <span class="like-count">${Array.isArray(note.likedBy) ? note.likedBy.length : 0}</span>
</button>

${note.ownerEmail === JSON.parse(localStorage.getItem("user"))?.email
        ? `
            <button
    onclick="editNote(${note.id})"
    title="Edit"
    aria-label="Edit Note"
>
    ✎
</button>

            <button
    onclick="deleteNote(${note.id})"
    title="Delete"
    aria-label="Delete Note"
>
    🗑
</button>
        `
        : ""
      }
                </div>

            </div>
        `;

    notesGrid.appendChild(card);
  });
}

// ==============================
// Open create modal
// ==============================

document.getElementById("createNoteBtn").addEventListener("click", () => {
  editingNoteId = null;

  modalTitle.textContent = "Create New Note";

  noteForm.reset();

  // Private is selected by default
  document.querySelector('input[name="visibility"][value="private"]').checked =
    true;

  noteModal.classList.remove("hidden");
});

// ==============================
// Close modal
// ==============================

function closeModal(skipConfirmation = false) {
  let hasChanges = false;

  if (editingNoteId && originalNoteData) {
    const currentVisibility =
      document.querySelector('input[name="visibility"]:checked')?.value ||
      "private";

    hasChanges =
      noteTitle.value.trim() !== originalNoteData.title ||
      noteContent.value.trim() !== originalNoteData.content ||
      noteFolder.value !== originalNoteData.folder ||
      currentVisibility !== originalNoteData.visibility ||
      noteFile.files.length > 0;
  } else {
    hasChanges =
      noteTitle.value.trim() !== "" ||
      noteContent.value.trim() !== "" ||
      noteFile.files.length > 0;
  }

  if (!skipConfirmation && hasChanges) {
    confirmModal.classList.remove("hidden");
    return;
  }

  noteModal.classList.add("hidden");

  editingNoteId = null;
  originalNoteData = null;

  noteForm.reset();

  document.querySelector('input[name="visibility"][value="private"]').checked =
    true;
}
const confirmModal = document.getElementById("confirmModal");
const confirmCancelBtn = document.getElementById("confirmCancelBtn");
const confirmDiscardBtn = document.getElementById("confirmDiscardBtn");

confirmCancelBtn.addEventListener("click", () => {
  confirmModal.classList.add("hidden");
});

confirmDiscardBtn.addEventListener("click", () => {
  confirmModal.classList.add("hidden");

  noteModal.classList.add("hidden");

  editingNoteId = null;
  originalNoteData = null;

  noteForm.reset();

  document.querySelector('input[name="visibility"][value="private"]').checked =
    true;
});

document.getElementById("closeModal").addEventListener("click", () => {
  closeModal();
});

document.getElementById("cancelModal").addEventListener("click", () => {
  closeModal();
});
// ==============================
// Create / Update note
// ==============================

noteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();

  if (!title) {
    showToast("Please enter a note title.", "error");
    noteTitle.focus();
    return;
  }

  if (!content) {
    showToast("Please enter some note content.", "error");
    noteContent.focus();
    return;
  }
  // Loading state
  const submitButton = noteForm.querySelector('button[type="submit"]');

  const wasEditing = !!editingNoteId;

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = wasEditing ? "Updating..." : "Saving...";
  }

  const formData = new FormData();

  formData.append("title", title);
  formData.append("content", content);

  formData.append("folder", noteFolder.value);

  formData.append("visibility", getSelectedVisibility());

  const currentUser = JSON.parse(localStorage.getItem("user"));
  if (noteFile.files.length > 0) {
    formData.append("file", noteFile.files[0]);
  }

  try {
    let response;

    if (editingNoteId) {
      response = await fetch(`/api/notes/${editingNoteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          title: title,
          content: content,
          folder: noteFolder.value,
          visibility: getSelectedVisibility(),
          ownerEmail: currentUser?.email || "",
        }),
      });
    } else {
      const token = localStorage.getItem("token");

      response = await fetch("/api/notes", {
        method: "POST",

        headers: {
          "Authorization": `Bearer ${token}`
        },

        body: formData
      });
    }

    if (!response.ok) {
      throw new Error("Could not save note.");
    }

    closeModal(true);

    await loadNotes();

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Save Note";
    }

    showToast(
      wasEditing ? "Note updated successfully." : "Note created successfully.",
      "success",
    );
    if (wasEditing) {
      addNotification(
        "Note updated",
        `"${title}" was updated.`,
        "✏️",
      );
    } else {
      addNotification(
        "New note created",
        `"${title}" was created.`,
        "📝",
      );
    }
  } catch (error) {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = wasEditing ? "Update Note" : "Save Note";
    }
    showToast(error.message, "error");
  }
});

// ==============================
// Edit note
// ==============================

async function editNote(id) {
  const note = notes.find((note) => note.id === id);

  if (!note) return;

  editingNoteId = id;

  originalNoteData = {
    title: note.title,
    content: note.content,
    folder: note.folder,
    visibility: note.visibility || "private",
  };

  modalTitle.textContent = "Edit Note";

  noteTitle.value = note.title;
  noteContent.value = note.content;
  noteFolder.value = note.folder;

  const visibility = note.visibility || "private";

  document.querySelector(
    `input[name="visibility"][value="${visibility}"]`,
  ).checked = true;

  noteModal.classList.remove("hidden");
}


// ==============================
// Delete confirmation modal
// ==============================

function showDeleteConfirm() {
  return new Promise((resolve) => {

    const overlay = document.createElement("div");

    overlay.className = "delete-confirm-overlay";

    overlay.innerHTML = `
            <div class="delete-confirm-modal">

                <div class="delete-confirm-icon">
                    🗑️
                </div>

                <h3>Move to Trash?</h3>

                <p>
                    This note will be moved to your Trash.
                    You can restore it later.
                </p>

                <div class="delete-confirm-actions">

                    <button
                        class="delete-cancel-btn"
                        type="button"
                    >
                        Cancel
                    </button>

                    <button
                        class="delete-confirm-btn"
                        type="button"
                    >
                        Move to Trash
                    </button>

                </div>

            </div>
        `;

    document.body.appendChild(overlay);

    const cancelButton =
      overlay.querySelector(".delete-cancel-btn");

    const confirmButton =
      overlay.querySelector(".delete-confirm-btn");

    function close(result) {

      overlay.classList.add("closing");

      setTimeout(() => {
        overlay.remove();
        resolve(result);
      }, 180);
    }

    cancelButton.addEventListener("click", () => {
      close(false);
    });

    confirmButton.addEventListener("click", () => {
      close(true);
    });

    overlay.addEventListener("click", (event) => {

      if (event.target === overlay) {
        close(false);
      }

    });

  });
}


// ==============================
// Delete note
// ==============================

async function deleteNote(id) {

  const confirmDelete = await showDeleteConfirm();

  if (!confirmDelete) return;

  try {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const response = await fetch(`/api/notes/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        ownerEmail: currentUser?.email || "",
      }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Could not move note to Trash.");
    }

    await loadNotes();
    showToast("Note moved to Trash.", "success");
    addNotification(
      "Note moved to trash",
      "A note was moved to the trash.",
      "🗑️",
    );
  } catch (error) {
    showToast(error.message, "error");
  }
}
// ==============================
// Favorite
// ==============================

async function toggleFavorite(id) {
  try {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    if (!currentUser) {
      showToast("Please login first.", "error");
      return;
    }

    const response = await fetch(`/api/notes/${id}/favorite`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        ownerEmail: currentUser.email,
      }),
    });

    if (!response.ok) {
      const data = await response.json();

      throw new Error(data.message || "Could not update favorite.");
    }

    await loadNotes();

    showToast("Favorite updated.", "success");

    addNotification(
      "Favorite updated",
      "A note's favorite status was changed.",
      "⭐",
    );
  } catch (error) {
    showToast(error.message, "error");
  }
}

// ==============================
// Like / Unlike
// ==============================

async function toggleLike(id) {
    try {
        const currentUser = JSON.parse(localStorage.getItem("user"));

        if (!currentUser) {
            showToast("Please login first.", "error");
            return;
        }

        const response = await fetch(`/api/notes/${id}/like`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not update like.");
        }

        await loadNotes();

        showToast(
            data.liked ? "Note liked ❤️" : "Like removed.",
            "success"
        );

    } catch (error) {
        console.error("Like error:", error);
        showToast(error.message, "error");
    }
}

function renderTrashNotes(trashNotes) {
  notesGrid.innerHTML = "";

  if (trashNotes.length === 0) {
    notesGrid.innerHTML = `
        <div class="empty-notes">

            <div class="empty-icon">
                🗑️
            </div>

            <h3>
                Trash is empty
            </h3>

            <p>
                Deleted notes will appear here.
            </p>

        </div>
    `;

    return;
  }

  trashNotes.forEach((note) => {
    const card = document.createElement("div");

    card.className = "note-card";

    card.innerHTML = `
            <div class="note-folder">
                ${escapeHTML(note.folder)}
            </div>

            <h3>
                ${escapeHTML(note.title)}
            </h3>

            <p>
                ${escapeHTML((note.content || "").substring(0, 100))}
            </p>

            <div class="note-footer">

                <span class="note-time">
                    Deleted
                </span>

                <div class="note-actions">

                    <button
                        onclick="restoreNote(${note.id})"
                        title="Restore"
                    >
                        ♻️
                    </button>

                    <button
                        onclick="permanentlyDeleteNote(${note.id})"
                        title="Delete Permanently"
                    >
                        ❌
                    </button>

                </div>

            </div>
        `;

    notesGrid.appendChild(card);
  });
}

async function restoreNote(id) {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  try {
    const response = await fetch(`/api/notes/${id}/restore`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
    });

    if (!response.ok) {
      const data = await response.json();

      throw new Error(data.message || "Could not restore note.");
    }

    showToast("Note restored successfully.", "success");

    document.getElementById("allNotesBtn").click();
  } catch (error) {
    showToast(error.message, "error");
  }
}
function showPermanentDeleteConfirm() {
  return new Promise((resolve) => {

    const overlay = document.createElement("div");

    overlay.className = "delete-confirm-overlay";

    overlay.innerHTML = `
            <div class="delete-confirm-modal permanent-delete-modal">

                <div class="delete-confirm-icon permanent-delete-icon">
                    ❌
                </div>

                <h3>Delete Permanently?</h3>

                <p>
                    This note will be permanently deleted.
                    <strong>This action cannot be undone.</strong>
                </p>

                <div class="delete-confirm-actions">

                    <button
                        class="delete-cancel-btn"
                        type="button"
                    >
                        Cancel
                    </button>

                    <button
                        class="delete-confirm-btn permanent-delete-btn"
                        type="button"
                    >
                        Delete Permanently
                    </button>

                </div>

            </div>
        `;

    document.body.appendChild(overlay);

    const cancelButton =
      overlay.querySelector(".delete-cancel-btn");

    const confirmButton =
      overlay.querySelector(".permanent-delete-btn");

    function close(result) {

      overlay.classList.add("closing");

      setTimeout(() => {
        overlay.remove();
        resolve(result);
      }, 180);
    }

    cancelButton.addEventListener("click", () => {
      close(false);
    });

    confirmButton.addEventListener("click", () => {
      close(true);
    });

    overlay.addEventListener("click", (event) => {

      if (event.target === overlay) {
        close(false);
      }

    });

  });
}
async function permanentlyDeleteNote(id) {

  const confirmDelete = await showPermanentDeleteConfirm();

  if (!confirmDelete) return;
  const currentUser = JSON.parse(localStorage.getItem("user"));

  try {
    const response = await fetch(`/api/notes/${id}/permanent`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
    });

    if (!response.ok) {
      const data = await response.json();

      throw new Error(data.message || "Could not permanently delete note.");
    }

    showToast("Note permanently deleted.", "success");
    document.getElementById("trashBtn").click();
  } catch (error) {
    showToast(error.message, "error");
  }
}

// ==============================
// Search
// ==============================

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();

  clearSearchBtn.classList.toggle("hidden", query === "");

  if (query) {
    document.getElementById("notesHeading").textContent =
      `Search Results for "${query}"`;
  } else {
    if (currentNoteView === "favorites") {
      document.getElementById("notesHeading").textContent = "Favorite Notes";
    } else if (currentNoteView === "mine") {
      document.getElementById("notesHeading").textContent = "My Notes";
    } else if (currentNoteView.startsWith("folder:")) {
      const folderName = currentNoteView.replace("folder:", "");

      document.getElementById("notesHeading").textContent = folderName;
    } else {
      document.getElementById("notesHeading").textContent = "Recent Notes";
    }
  }

  applyNoteFilters();
});
clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";

  clearSearchBtn.classList.add("hidden");

  applyNoteFilters();
  searchInput.focus();
});

// ==============================
// Favorites button
// ==============================

favoritesBtn.addEventListener("click", () => {
  currentNoteView = "favorites";

  setActiveNav(favoritesBtn);

  document.getElementById("notesHeading").textContent = "Favorite Notes";

  applyNoteFilters();
});
// ==============================
// Trash
// ==============================

const trashBtn = document.getElementById("trashBtn");

trashBtn.addEventListener("click", async () => {
  setActiveNav(trashBtn);

  document.getElementById("notesHeading").textContent = "Trash";

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "/api/notes/trash",
      {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );
    if (!response.ok) {
      throw new Error("Could not load Trash.");
    }

    const trashNotes = await response.json();

    renderTrashNotes(trashNotes);
  } catch (error) {
    console.error("Could not load Trash:", error);
  }
});

function applyNoteFilters() {
  let filteredNotes = [...notes];

  // My Notes filter
  if (currentNoteView === "mine") {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    if (currentUser) {
      filteredNotes = filteredNotes.filter(
        (note) => note.ownerEmail === currentUser.email,
      );
    }
  }

  // Favorites filter
  // Favorites filter
  if (currentNoteView === "favorites") {
    filteredNotes = filteredNotes.filter((note) => isFavorite(note));
  }

  // Folder filter
  if (currentNoteView.startsWith("folder:")) {
    const folderName = currentNoteView.replace("folder:", "");

    filteredNotes = filteredNotes.filter((note) => note.folder === folderName);
  }

  // Search filter
  const query = searchInput.value.trim().toLowerCase();

  if (query) {
    filteredNotes = filteredNotes.filter((note) => {
      const title = (note.title || "").toLowerCase();

      const content = (note.content || "").toLowerCase();

      const folder = (note.folder || "").toLowerCase();

      return (
        title.includes(query) ||
        content.includes(query) ||
        folder.includes(query)
      );
    });
  }

  renderNotes(filteredNotes);
}
// ==============================
// All notes
// ==============================

allNotesBtn.addEventListener("click", () => {
  currentNoteView = "all";

  setActiveNav(allNotesBtn);

  document.getElementById("notesHeading").textContent = "Recent Notes";

  applyNoteFilters();
});

// ==============================
// Folder buttons
// ==============================

document.querySelectorAll(".folder-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const folder = button.textContent.trim();

    currentNoteView = `folder:${folder}`;

    setActiveNav(button);

    document.getElementById("notesHeading").textContent = folder;

    applyNoteFilters();
  });
});

// ==============================
// Security helper
// ==============================

function escapeHTML(text) {
  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}

// ==============================
// Start application
// ==============================
loadNotes();

// ==============================
// Logout
// ==============================

const logoutBtn = document.getElementById("logoutBtn");
const sidebarLogoutBtn = document.getElementById("sidebarLogoutBtn");

function logoutUser() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");

  window.location.href = "index.html";
}

logoutBtn.addEventListener("click", logoutUser);

sidebarLogoutBtn.addEventListener("click", logoutUser);

// ==============================
// Mobile Sidebar
// ==============================

menuToggle.addEventListener("click", (event) => {
  event.stopPropagation();

  sidebar.classList.toggle("open");
});

// Close when clicking outside sidebar

document.addEventListener("click", (event) => {
  if (
    sidebar.classList.contains("open") &&
    !sidebar.contains(event.target) &&
    !menuToggle.contains(event.target)
  ) {
    sidebar.classList.remove("open");
  }
});

// Close when clicking navigation items

sidebar.querySelectorAll(".nav-item, .new-folder").forEach((item) => {
  item.addEventListener("click", () => {
    sidebar.classList.remove("open");
  });
});

// ==============================
// New Folder
// ==============================

const newFolderBtn = document.getElementById("newFolderBtn");

const folderModal = document.getElementById("folderModal");
const folderModalClose = document.getElementById("folderModalClose");
const folderCancelBtn = document.getElementById("folderCancelBtn");
const folderForm = document.getElementById("folderForm");
const folderNameInput = document.getElementById("folderNameInput");

// Open New Folder modal
newFolderBtn.addEventListener("click", (event) => {
  event.stopPropagation();

  folderNameInput.value = "";

  folderModal.classList.remove("hidden");

  setTimeout(() => {
    folderNameInput.focus();
  }, 100);
});

// Close modal
function closeFolderModal() {
  folderModal.classList.add("hidden");
}

// Close button
folderModalClose.addEventListener("click", closeFolderModal);

// Cancel button
folderCancelBtn.addEventListener("click", closeFolderModal);

// Close when clicking outside
folderModal.addEventListener("click", (event) => {
  if (event.target === folderModal) {
    closeFolderModal();
  }
});

// Create folder
folderForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const trimmedName = folderNameInput.value.trim();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  if (!currentUser) {
    showToast("Please login first.", "error");
    closeFolderModal();
    return;
  }
  if (!trimmedName) {
    showToast("Please enter a folder name.", "error");

    folderNameInput.focus();

    return;
  }
  // Folder was successfully saved

  // Save folder to backend

  try {
    const response = await fetch("/api/folders", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },

      body: JSON.stringify({
        name: trimmedName,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not create folder.");
    }

    // Continue creating the folder

    // Create folder button

    const folder = document.createElement("button");

    folder.className = "nav-item folder-btn";

    folder.innerHTML = `
        <span>📁</span>
        ${escapeHTML(trimmedName)}
    `;

    // Folder click

    folder.addEventListener("click", () => {
      currentNoteView = `folder:${trimmedName}`;

      setActiveNav(folder);

      document.getElementById("notesHeading").textContent = trimmedName;

      applyNoteFilters();
    });

    // Add folder BEFORE + New Folder

    newFolderBtn.parentElement.insertBefore(folder, newFolderBtn);

    // Update folder count immediately
    const currentFolderCount = Number(folderCount.textContent) || 0;
    folderCount.textContent = currentFolderCount + 1;

    closeFolderModal();

    showToast(`"${trimmedName}" folder created.`, "success");
    addNotification(
      "New folder created",
      `"${trimmedName}" was created.`,
      "📁",
    );
  } catch (error) {
    console.error("Could not create folder:", error);

    showToast(error.message || "Could not create folder.", "error");
  }
});

loadFolders();
// ==============================
// Search Keyboard Shortcut
// ==============================

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();

    const searchInput = document.querySelector("#searchInput");

    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }
});
// Close notification panel with Escape
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  // Close notification panel
  if (!notificationPanel.classList.contains("hidden")) {
    notificationPanel.classList.add("hidden");
    return;
  }

  // Close confirmation modal
  if (!confirmModal.classList.contains("hidden")) {
    confirmModal.classList.add("hidden");
    return;
  }

  // Close note modal
  if (!noteModal.classList.contains("hidden")) {
    closeModal();
  }
});
// ==============================
// Escape Key - Close Modals
// ==============================


// ==============================
// Note Character Counter
// ==============================

const characterCount = document.getElementById("characterCount");

if (noteContent && characterCount) {
  noteContent.addEventListener("input", () => {
    characterCount.textContent = noteContent.value.length;
  });
}
const titleCharacterCount = document.getElementById("titleCharacterCount");

if (noteTitle && titleCharacterCount) {
  noteTitle.addEventListener("input", () => {
    titleCharacterCount.textContent = noteTitle.value.length;
  });
}
