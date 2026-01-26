// 1. GLOBAL STATE & AUTH
let expenseList = [];
const token = localStorage.getItem("token");

// Redirect if not logged in
if (!token) {
  window.location.href = "../Signin/signin.html";
}

// 2. DOM ELEMENTS
const addBtn = document.getElementById("addExpense");
const amountInput = document.getElementById("inputAmount");
const descInput = document.getElementById("inputDesc");
const categoryInput = document.getElementById("selectCategory");
const ul = document.getElementById("ExpenseList");
const welcomeMsg = document.getElementById("welcome-user");
const logoutBtn = document.getElementById("logoutBtn");

// 3. INITIAL LOAD
document.addEventListener("DOMContentLoaded", () => {
  const name = localStorage.getItem("userName");
  if (name && welcomeMsg) welcomeMsg.innerText = `Welcome, ${name}`;

  // Attach logout event
  logoutBtn.addEventListener("click", logout);

  initialize();
});

async function initialize() {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/expense/getexpenses",
      {
        headers: { Authorization: token },
      },
    );
    expenseList = response.data;
    renderUI();
  } catch (err) {
    handleAuthError(err);
  }
}

// 4. RENDER UI
function renderUI() {
  ul.innerHTML = "";
  expenseList.forEach((expense) => display(expense));
}

// 5. ADD EXPENSE
addBtn.addEventListener("click", async (e) => {
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
    const response = await axios.post(
      "http://localhost:3000/api/expense/addexpense",
      expenseObj,
      {
        headers: { Authorization: token },
      },
    );

    expenseList.push(response.data.expense);
    renderUI();
    clearInputs();
  } catch (err) {
    console.error("Error saving data:", err);
  }
});

// 6. DISPLAY FUNCTION
function display(expense) {
  const li = document.createElement("li");
  li.id = `expense-${expense.id}`;
  li.className =
    "list-group-item d-flex justify-content-between align-items-center mb-2 p-2 border rounded bg-light";

  li.innerHTML = `
        <span><strong>₹${expense.amount}</strong> - ${expense.description} <small class="text-muted">(${expense.category})</small></span>
        <button class="btn btn-danger btn-sm" onclick="deleteExpense(${expense.id})">Delete</button>
    `;
  ul.appendChild(li);
}

// 7. DELETE FUNCTION
async function deleteExpense(id) {
  try {
    await axios.delete(
      `http://localhost:3000/api/expense/deleteexpense/${id}`,
      {
        headers: { Authorization: token },
      },
    );

    expenseList = expenseList.filter((exp) => exp.id !== id);
    renderUI();
  } catch (err) {
    console.error("Delete failed:", err);
  }
}

// 8. LOGOUT & UTILS
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
}
