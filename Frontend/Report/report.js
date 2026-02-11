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

  const pageData = allCombinedData.slice(startIndex, endIndex);

  renderReportTable(pageData);
  renderPaginationButtons();
}

function renderReportTable(data) {
  const tableBody = document.getElementById("reportTableBody");
  const tableFooter = document.getElementById("reportTableFooter");

  tableBody.innerHTML = "";

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

  let totalIncome = 0;
  let totalExpense = 0;

  allCombinedData.forEach((item) => {
    totalIncome += parseFloat(item.income) || 0;
    totalExpense += parseFloat(item.amount) || 0;
  });

  const netBalance = totalIncome - totalExpense;

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

// ==========================================
// 4. DOWNLOAD BUTTON EVENT LISTENER (NEW)
// ==========================================
const downloadBtn = document.getElementById("downloadReportBtn");

if (downloadBtn) {
  downloadBtn.addEventListener("click", async () => {
    const token = localStorage.getItem("token");

    try {
      // 1. Change button UI to show "Loading"
      const originalHTML = downloadBtn.innerHTML;
      downloadBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Downloading...`;
      downloadBtn.disabled = true;

      // 2. Request the download URL from backend
      const response = await axios.get(
        "http://localhost:3000/api/expense/downloadexpenses",
        {
          headers: { Authorization: token },
        },
      );

      if (response.status === 200) {
        // 3. The backend returns { fileUrl: "..." }
        const fileUrl = response.data.fileUrl;

        // 4. Create a virtual link to trigger browser download
        const a = document.createElement("a");
        a.href = fileUrl;
        document.body.appendChild(a);
        a.click();
        a.remove();
        // Refresh the history table so the new file shows up immediately
        loadDownloadHistory();
      }

      // Reset button
      downloadBtn.innerHTML = originalHTML;
      downloadBtn.disabled = false;
    } catch (err) {
      console.error("Download Error:", err);
      alert(err.response?.data?.message || "Error: Could not download report.");

      // Reset button on error
      downloadBtn.innerHTML = `<i class="bi bi-file-earmark-spreadsheet me-1"></i> Download File`;
      downloadBtn.disabled = false;
    }
  });
}

async function loadDownloadHistory() {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      "http://localhost:3000/api/expense/downloadhistory",
      {
        headers: { Authorization: token },
      },
    );

    const historyData = response.data.history;
    const historyTableBody = document.getElementById(
      "downloadHistoryTableBody",
    );
    historyTableBody.innerHTML = "";

    if (historyData.length === 0) {
      historyTableBody.innerHTML = `<tr><td colspan="3" class="text-muted">No download history found.</td></tr>`;
      return;
    }

    historyData.forEach((item) => {
      const row = `
                <tr>
                    <td>${new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>${item.fileName}</td>
                    <td>
                        <a href="${item.fileUrl}" class="btn btn-outline-primary btn-sm">
                            <i class="bi bi-download"></i> Download
                        </a>
                    </td>
                </tr>`;
      historyTableBody.insertAdjacentHTML("beforeend", row);
    });
  } catch (err) {
    console.error("Error loading download history:", err);
  }
}

// Initial Load
window.addEventListener("DOMContentLoaded", () => {
  loadReport(); // Your existing expense table
  loadDownloadHistory(); // Your new download history table
});
