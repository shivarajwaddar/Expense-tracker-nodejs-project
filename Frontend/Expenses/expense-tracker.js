// ================================
// 1. GLOBAL STATE & AUTH
// ================================
let expenseList = [];
let currentPage = 1;
const token = localStorage.getItem("token");

// Redirect if not logged in
if (!token) {
  window.location.href = "../Signin/signin.html";
}

// ================================
// 2. DOM LOADED
// ================================
document.addEventListener("DOMContentLoaded", () => {
  // DOM ELEMENTS
  const expenseForm = document.getElementById("expenseForm");
  const amountInput = document.getElementById("inputAmount");
  const descInput = document.getElementById("inputDesc");
  const categoryInput = document.getElementById("selectCategory");
  const ul = document.getElementById("ExpenseList");
  const welcomeMsg = document.getElementById("welcome-user");
  const logoutBtn = document.getElementById("logoutBtn");
  const paginationUl = document.getElementById("expensePagination");

  // Welcome user
  const name = localStorage.getItem("userName");
  if (name && welcomeMsg) {
    welcomeMsg.innerText = `Welcome, ${name}`;
  }

  // Logout event
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // Add Expense event
  if (expenseForm) {
    expenseForm.addEventListener("submit", addExpense);
  }

  // Initial load - starts with page 1
  fetchExpenses(1);

  // ================================
  // FUNCTIONS
  // ================================

  async function fetchExpenses(page) {
    try {
      currentPage = page;
      // UPDATED: Using relative path for AWS deployment
      const response = await axios.get(
        `/api/expense/getexpenses?page=${page}`,
        {
          headers: { Authorization: token },
        },
      );

      // Backend returns { expenses: [], totalPages: x, currentPage: y }
      expenseList = response.data.expenses;
      renderUI();
      renderPagination(response.data.totalPages, response.data.currentPage);
    } catch (err) {
      console.error("Fetch Error:", err);
      handleAuthError(err);
    }
  }

  function renderUI() {
    ul.innerHTML = "";
    if (expenseList.length === 0) {
      ul.innerHTML =
        '<li class="list-group-item text-center text-muted">No expenses found.</li>';
      return;
    }
    expenseList.forEach((expense) => display(expense));
  }

  function renderPagination(totalPages, activePage) {
    if (!paginationUl) return;
    paginationUl.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement("li");
      li.className = `page-item ${i === activePage ? "active" : ""}`;

      const btn = document.createElement("button");
      btn.className = "page-link";
      btn.innerText = i;
      btn.onclick = () => fetchExpenses(i);

      li.appendChild(btn);
      paginationUl.appendChild(li);
    }
  }

  async function addExpense(e) {
    e.preventDefault();

    const expenseObj = {
      amount: amountInput.value,
      description: descInput.value,
      category: categoryInput.value,
    };

    if (!expenseObj.amount || !expenseObj.description) {
      return alert("Please fill all fields");
    }

    try {
      // UPDATED: Using relative path for AWS deployment
      await axios.post("/api/expense/addexpense", expenseObj, {
        headers: { Authorization: token },
      });

      // After adding, go back to page 1 to see the newest item
      fetchExpenses(1);
      clearInputs();
    } catch (err) {
      console.error("Error saving expense:", err);
      alert("Failed to save expense. Please try again.");
    }
  }

  function display(expense) {
    const li = document.createElement("li");
    li.id = `expense-${expense.id}`;
    li.className =
      "list-group-item d-flex justify-content-between align-items-center mb-1 p-2 border rounded bg-light";

    li.innerHTML = `
      <span>
        <strong>₹${expense.amount}</strong> - ${expense.description}
        <small class="text-muted">(${expense.category})</small>
      </span>
      <button class="btn btn-danger btn-sm shadow-sm">Delete</button>
    `;

    li.querySelector("button").addEventListener("click", () => {
      deleteExpense(expense.id);
    });

    ul.appendChild(li);
  }

  async function deleteExpense(id) {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      // UPDATED: Using relative path for AWS deployment
      await axios.delete(`/api/expense/deleteexpense/${id}`, {
        headers: { Authorization: token },
      });

      // Refresh the current page to update the list correctly
      fetchExpenses(currentPage);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete expense.");
    }
  }

  function logout() {
    localStorage.clear();
    window.location.href = "../Signin/signin.html";
  }

  function handleAuthError(err) {
    if (err.response && err.response.status === 401) {
      alert("Session expired. Please login again.");
      logout();
    }
  }

  function clearInputs() {
    amountInput.value = "";
    descInput.value = "";
    categoryInput.value = "Fuel";
  }
});
