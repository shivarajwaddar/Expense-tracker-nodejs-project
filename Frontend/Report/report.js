// ================================
// 1. GLOBAL STATE & CONFIG
// ================================
let allCombinedData = [];
let currentReportPage = 1;
const rowsPerPage = 10;

const localIncome = [
  {
    date: "2026-02-01",
    description: "Monthly Salary",
    category: "Work",
    income: 55000,
    amount: 0,
  },
];

// Helper: Formats date for sorting/display
function formatDate(dateStr) {
  return dateStr ? dateStr.split("T")[0] : "2026-02-01";
}

// ================================
// 2. DATA LOAD & MERGE
// ================================
async function loadReport() {
  const token = localStorage.getItem("token");
  try {
    // We fetch the full list for reporting to ensure totals are accurate
    const response = await axios.get(
      "http://localhost:3000/api/expense/getexpenses",
      {
        headers: { Authorization: token },
      },
    );

    const rawBackendData = response.data.expenses || response.data;

    const backendExpenses = rawBackendData.map((item) => ({
      ...item,
      date: formatDate(item.createdAt),
      income: 0,
    }));

    // Merge and Sort (Newest Date first)
    allCombinedData = [...localIncome, ...backendExpenses].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );

    displayPage(1);
  } catch (error) {
    console.error("Error fetching report data:", error);
    allCombinedData = [...localIncome];
    displayPage(1);
  }
}

// ================================
// 3. PAGINATION & RENDERING
// ================================
function displayPage(page) {
  currentReportPage = page;
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  // Take only the 10 rows for this page
  const pageData = allCombinedData.slice(startIndex, endIndex);

  renderReportTable(pageData);
  renderPaginationButtons();
}

function renderReportTable(data) {
  const tableBody = document.getElementById("reportTableBody");
  const tableFooter = document.getElementById("reportTableFooter");

  // Clear current view
  tableBody.innerHTML = "";

  // Render Rows for CURRENT PAGE
  data.forEach((item) => {
    const inc = parseFloat(item.income) || 0;
    const exp = parseFloat(item.amount) || 0;

    const row = `
        <tr>
            <td>${item.date}</td>
            <td>${item.description}</td>
            <td><span class="badge bg-primary-subtle text-primary border border-primary-subtle">${item.category}</span></td>
            <td class="text-success">${inc > 0 ? "₹" + inc.toLocaleString() : "-"}</td>
            <td class="text-danger">${exp > 0 ? "₹" + exp.toLocaleString() : "-"}</td>
        </tr>`;
    tableBody.insertAdjacentHTML("beforeend", row);
  });

  // Calculate GRAND TOTALS (Across ALL pages)
  let totalIncome = 0;
  let totalExpense = 0;

  allCombinedData.forEach((item) => {
    totalIncome += parseFloat(item.income) || 0;
    totalExpense += parseFloat(item.amount) || 0;
  });

  const netBalance = totalIncome - totalExpense;

  // Update Footer with Overall Calculations
  tableFooter.innerHTML = `
        <tr class="table-light">
            <td colspan="3" class="text-end fw-bold">Grand Totals (All Data):</td>
            <td class="text-success fw-bold">₹${totalIncome.toLocaleString()}</td>
            <td class="text-danger fw-bold">₹${totalExpense.toLocaleString()}</td>
        </tr>
        <tr class="table-secondary">
            <td colspan="3" class="text-end fw-bold fs-6">Overall Net Balance:</td>
            <td colspan="2" class="fw-bold fs-6 ${netBalance >= 0 ? "text-primary" : "text-danger"}">
                ₹${netBalance.toLocaleString()}
            </td>
        </tr>`;
}

function renderPaginationButtons() {
  const paginationUl = document.getElementById("reportPagination");
  if (!paginationUl) return;
  paginationUl.innerHTML = "";

  const totalPages = Math.ceil(allCombinedData.length / rowsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentReportPage ? "active" : ""}`;
    li.innerHTML = `<button class="page-link" onclick="displayPage(${i})">${i}</button>`;
    paginationUl.appendChild(li);
  }
}

// Initial Load
window.addEventListener("DOMContentLoaded", loadReport);
