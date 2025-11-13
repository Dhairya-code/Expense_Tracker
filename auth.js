// ====== AUTH.JS - Handles Login and Registration ======

// Toggle between login and register
function toggleAuth(mode) {
  const loginSection = document.getElementById("login-section");
  const registerSection = document.getElementById("register-section");
  if (mode === "register") {
    loginSection.style.display = "none";
    registerSection.style.display = "block";
  } else {
    loginSection.style.display = "block";
    registerSection.style.display = "none";
  }
}

// Register user
function registerUser() {
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const confirmPassword = document.getElementById("regConfirmPassword").value.trim();

  if (!name || !email || !password || !confirmPassword) {
    alert("Please fill all fields!");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];

  if (users.some(u => u.email === email)) {
    alert("User already exists. Please login!");
    toggleAuth("login");
    return;
  }

  users.push({ name, email, password });
  localStorage.setItem("users", JSON.stringify(users));
  alert("Registration successful! You can now login.");
  toggleAuth("login");
}

// Login user
function loginUser() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    alert("Invalid email or password!");
    return;
  }

  localStorage.setItem("loggedInUser", JSON.stringify(user));
  window.location.href = "dashboard.html";
}

// Auto redirect to login if not authenticated
(function checkAuth() {
  if (window.location.pathname.includes("dashboard.html")) {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user) window.location.href = "index.html";
  }
})();

// Logout
function logoutUser() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}
