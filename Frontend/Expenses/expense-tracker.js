console.log("Expense Tracker Initialized");

// 1. GLOBAL STATE
let expenseList = [];
// let editingExpenseId = null;

// 2. DOM ELEMENTS
const addBtn = document.getElementById("addExpense");
const amountInput = document.getElementById("inputAmount");
const descInput = document.getElementById("inputDesc");
const categoryInput = document.getElementById("selectCategory");
const ul = document.querySelector("ul");

// 3. INITIAL LOAD
document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/expense/getexpenses",
    );
    expenseList = response.data; // Sync global array with Database
    renderUI();
  } catch (err) {
    console.error("Error fetching expenses:", err);
  }
}

// 4. RENDER UI FROM GLOBAL ARRAY
function renderUI() {
  ul.innerHTML = ""; // Clear list
  expenseList.forEach((expense) => {
    display(expense);
  });
}

// 5. ADD / UPDATE EXPENSE
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
    // if (editingExpenseId) {
    //   // UPDATE LOGIC
    //   const response = await axios.put(
    //     `http://localhost:3000/expense/editexpense/${editingExpenseId}`,
    //     expenseObj,
    //   );

    //   // Update the array locally
    //   const index = expenseList.findIndex((ev) => ev.id === editingExpenseId);
    //   expenseList[index] = response.data; // Assuming backend returns updated object

    //   editingExpenseId = null;
    //   addBtn.innerText = "Submit";
    // } else {
    // CREATE LOGIC
    const response = await axios.post(
      "http://localhost:3000/api/expense/addexpense",
      expenseObj,
    );
    console.log(response.data.expense);
    expenseList.push(response.data.expense); // Add new item from server to array
    // }

    renderUI();
    clearInputs();
  } catch (err) {
    console.error("Error saving data:", err);
  }
});

// 6. DISPLAY FUNCTION (Builds the HTML)
function display(expense) {
  const li = document.createElement("li");
  li.id = `expense-${expense.id}`;
  li.style =
    "display: flex; justify-content: space-between; align-items: center; margin: 6px 0; padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; background: #fafafa;";

  const leftText = document.createElement("span");
  leftText.textContent = `${expense.amount} - ${expense.description} (${expense.category})`;

  const btnContainer = document.createElement("div");

  // Edit Button
  const editBtn = document.createElement("button");
  editBtn.id = `edit-btn-${expense.id}`;
  editBtn.textContent = "Edit";
  editBtn.style =
    "margin-left: 6px; font-size: 12px; padding: 3px 6px; cursor: pointer; background-color: #ffc107; border: none; border-radius: 3px;";
  // editBtn.onclick = () => editExistingExpense(expense.id);

  // Delete Button
  const delBtn = document.createElement("button");
  delBtn.id = `del-btn-${expense.id}`;
  delBtn.textContent = "Delete";
  delBtn.style =
    "margin-left: 6px; font-size: 12px; padding: 3px 6px; cursor: pointer; background-color: #d9534f; color: white; border: none; border-radius: 3px;";
  delBtn.onclick = () => deleteExpense(expense.id);

  btnContainer.appendChild(editBtn);
  btnContainer.appendChild(delBtn);
  li.appendChild(leftText);
  li.appendChild(btnContainer);
  ul.appendChild(li);
}

// 7. DELETE FUNCTION
async function deleteExpense(id) {
  try {
    await axios.delete(`http://localhost:3000/api/expense/deleteexpense/${id}`);
    // Remove from Global Array
    expenseList = expenseList.filter((exp) => exp.id !== id);
    renderUI();
  } catch (err) {
    console.error("Delete failed:", err);
  }
}

// // 8. EDIT PRE-FILL
// function editExistingExpense(expenseId) {
//   const expenseToEdit = expenseList.find((exp) => exp.id === expenseId);

//   if (expenseToEdit) {
//     amountInput.value = expenseToEdit.amount;
//     descInput.value = expenseToEdit.description;
//     categoryInput.value = expenseToEdit.category;

//     editingExpenseId = expenseId;
//     addBtn.innerText = "Update Expense";
//   }
// }

function clearInputs() {
  amountInput.value = "";
  descInput.value = "";
  categoryInput.value = "";
}
