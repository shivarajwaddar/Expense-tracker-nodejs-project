// 1. Local Data (Your fixed Income row)
const localIncome = [
  {
    date: "2026-02-01",
    description: "Monthly Salary",
    category: "Work",
    income: 55000,
    expense: 0,
  },
];

// Helper Function: Generates a random date for the year 2026
function getRandomDate() {
  const month = "02"; // February
  const day = Math.floor(Math.random() * 28) + 1; // 1 to 28
  const dayString = day < 10 ? `0${day}` : day;
  return `2026-${month}-${dayString}`;
}

// 2. Main Function to Fetch and Merge Data
async function loadReport() {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/expense/getexpenses",
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      },
    );

    // Map through backend data to ensure every item has a date (using random if missing)
    const backendExpenses = response.data.map((item) => ({
      ...item,
      // Use existing date if available, otherwise assign a random one
      date: item.date ? item.date.split("T")[0] : getRandomDate(),
    }));

    // Merge and sort by date so the report looks organized
    const combinedData = [...localIncome, ...backendExpenses].sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
    console.log(backendExpenses);

    renderReportTable(combinedData);
  } catch (error) {
    console.error("Error fetching backend data:", error);
    renderReportTable(localIncome);
  }
}

// 3. Render Function with Net Balance calculation
function renderReportTable(data) {
  const tableBody = document.getElementById("reportTableBody");
  const tableFooter = document.getElementById("reportTableFooter");

  let totalIncome = 0;
  let totalExpense = 0;

  tableBody.innerHTML = "";

  data.forEach((item) => {
    const inc = parseFloat(item.income) || 0;
    const exp = parseFloat(item.amount) || 0;

    totalIncome += inc;
    totalExpense += exp;

    const row = `
            <tr>
                <td>${item.date}</td>
                <td>${item.description}</td>
                <td><span class="badge bg-primary-subtle text-primary border border-primary-subtle">${item.category}</span></td>
                <td class="text-success">${inc > 0 ? "₹" + inc.toLocaleString() : "-"}</td>
                <td class="text-danger">${exp > 0 ? "₹" + exp.toLocaleString() : "-"}</td>
            </tr>
        `;
    tableBody.insertAdjacentHTML("beforeend", row);
  });

  // Calculate Net Balance
  const netBalance = totalIncome - totalExpense;

  tableFooter.innerHTML = `
        <tr class="table-light">
            <td colspan="3" class="text-end fw-bold">Totals:</td>
            <td class="text-success fw-bold">₹${totalIncome.toLocaleString()}</td>
            <td class="text-danger fw-bold">₹${totalExpense.toLocaleString()}</td>
        </tr>
        <tr class="table-secondary">
            <td colspan="3" class="text-end fw-bold fs-5">Net Balance:</td>
            <td colspan="2" class="fw-bold fs-5 ${netBalance >= 0 ? "text-primary" : "text-danger"}">
                ₹${netBalance.toLocaleString()}
            </td>
        </tr>
    `;
}

// 4. Trigger on Load
window.addEventListener("DOMContentLoaded", () => {
  loadReport();
});
