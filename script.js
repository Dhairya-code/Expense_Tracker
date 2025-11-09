document.addEventListener("DOMContentLoaded", () => {
  // ===== User Authentication =====
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  document.getElementById("userEmail").textContent = `Logged in as: ${user.email}`;

  // ===== Initialize =====
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  let darkMode = false;

  // ===== DOM Elements =====
  const addBtn = document.getElementById("addBtn");
  const titleInput = document.getElementById("title");
  const amountInput = document.getElementById("amount");
  const dateInput = document.getElementById("date");
  const categoryInput = document.getElementById("category");
  const expenseTable = document.getElementById("expenseTable");
  const totalAmountEl = document.getElementById("totalAmount");
  const searchInput = document.getElementById("searchInput");
  const ctx = document.getElementById("expenseChart").getContext("2d");

  // ===== Chart Instance =====
  let expenseChart = null;

  // ===== Event Listeners =====
  addBtn.addEventListener("click", addExpense);
  searchInput.addEventListener("keyup", filterExpenses);

  // ===== Functions =====
  function addExpense() {
    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!title || !amount || !category || !date) {
      return alert("Fill all fields!");
    }

    expenses.push({ id: Date.now(), title, amount, category, date });
    localStorage.setItem("expenses", JSON.stringify(expenses));

    // Reset inputs
    titleInput.value = "";
    amountInput.value = "";
    categoryInput.value = "";
    dateInput.value = "";

    renderExpenses();
  }

  function renderExpenses(filteredExpenses = expenses) {
    expenseTable.innerHTML = "";

    // Group by category
    const grouped = {};
    filteredExpenses.forEach(e => {
      if (!grouped[e.category]) grouped[e.category] = [];
      grouped[e.category].push(e);
    });

    let total = 0;
    for (const category in grouped) {
      const totalCategory = grouped[category].reduce((s, e) => s + e.amount, 0);
      total += totalCategory;

      const dropdownId = "drop" + category.replace(/\s/g, "");
      const row = `
        <tr>
          <td>${category}</td>
          <td>₹${totalCategory}</td>
          <td>
            <button class="btn btn-sm btn-outline-info" data-bs-toggle="collapse" data-bs-target="#${dropdownId}">Show</button>
          </td>
        </tr>
        <tr class="collapse bg-secondary" id="${dropdownId}">
          <td colspan="3">
            <table class="table table-bordered table-sm table-dark mb-0">
              <thead>
                <tr><th>Title</th><th>Amount</th><th>Date</th><th>Action</th></tr>
              </thead>
              <tbody>
                ${grouped[category].map(e => `
                  <tr>
                    <td>${e.title}</td>
                    <td>₹${e.amount}</td>
                    <td>${e.date}</td>
                    <td>
                      <button class="btn btn-warning btn-sm" onclick="editExpense(${e.id})">Edit</button>
                      <button class="btn btn-danger btn-sm" onclick="deleteExpense(${e.id})">Delete</button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </td>
        </tr>
      `;
      expenseTable.innerHTML += row;
    }

    totalAmountEl.textContent = total;
    renderChart(grouped);
  }

  // ===== Filter Expenses =====
  function filterExpenses() {
    const q = searchInput.value.toLowerCase();
    const filtered = expenses.filter(
      e => e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)
    );
    renderExpenses(filtered);
  }

  // ===== Edit & Delete =====
  window.editExpense = function (id) {
    const exp = expenses.find(e => e.id === id);
    if (!exp) return;
    const newTitle = prompt("Edit Title:", exp.title);
    const newAmount = parseFloat(prompt("Edit Amount:", exp.amount));
    if (newTitle && !isNaN(newAmount)) {
      exp.title = newTitle;
      exp.amount = newAmount;
      localStorage.setItem("expenses", JSON.stringify(expenses));
      renderExpenses();
    }
  };

  window.deleteExpense = function (id) {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    expenses = expenses.filter(e => e.id !== id);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    renderExpenses();
  };

  // ===== Export CSV =====
  window.exportCSV = function () {
    let csv = "Title,Amount,Category,Date\n";
    expenses.forEach(e => csv += `${e.title},${e.amount},${e.category},${e.date}\n`);
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "expenses.csv";
    a.click();
  };

  // ===== Dark Mode =====
  window.toggleDarkMode = function () {
    darkMode = !darkMode;
    document.body.classList.toggle("dark-mode", darkMode);
    document.querySelectorAll(".glass-card").forEach(c => c.classList.toggle("dark-card", darkMode));
  };

  // ===== Render Chart =====
  function renderChart(grouped) {
    const labels = Object.keys(grouped);
    const data = Object.values(grouped).map(list => list.reduce((s, e) => s + e.amount, 0));

    if (expenseChart) expenseChart.destroy();
    expenseChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            "#00bfa6", "#2196f3", "#ff9800", "#f44336", "#9c27b0"
          ],
          borderColor: "#000",
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: "#fff", font: { size: 14 } } } }
      }
    });
  }

  // ===== Logout =====
  window.logoutUser = function () {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
  };

  // ===== Initial Render =====
  renderExpenses();
});
