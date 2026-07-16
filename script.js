// ===============================
// Expense Tracker Pro (JS Logic)
// ===============================

// HTML Elements
const form = document.getElementById("transaction-form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const type = document.getElementById("type");

const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

const list = document.getElementById("list");
const search = document.getElementById("search");
const filterType = document.getElementById("filterType");
const sortBy = document.getElementById("sortBy");

const monthReport = document.getElementById("monthReport");
const yearReport = document.getElementById("yearReport");
const themeBtn = document.getElementById("themeBtn");

// Load Data
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Load Theme State
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeBtn.innerHTML = "☀️";
} else {
    themeBtn.innerHTML = "🌙";
}

// Theme Switch Event
themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        themeBtn.innerHTML = "☀️";
    } else {
        localStorage.setItem("theme", "light");
        themeBtn.innerHTML = "🌙";
    }
});

// Form Submission Hook
form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (text.value.trim() === "" || amount.value.trim() === "") {
        alert("Please completely fill out the form fields.");
        return;
    }

    const today = new Date();

    const transaction = {
        id: Date.now(), // Safe ID for consistent indexing during searches
        text: text.value.trim(),
        amount: Number(amount.value),
        category: category.value,
        type: type.value,
        date: today.toISOString(),
        formattedDate: today.toLocaleDateString(),
        formattedTime: today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    transactions.push(transaction);
    saveData();

    // Field Resets
    text.value = "";
    amount.value = "";

    applyFilterAndRender();
});

// Sync data helper
function saveData() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Render DOM lists and Global Balances
function renderDOM(filteredData) {
    list.innerHTML = "";

    let totalIncome = 0;
    let totalExpense = 0;

    filteredData.forEach((item) => {
        const li = document.createElement("li");
        li.classList.add(item.type === "income" ? "income-border" : "expense-border");

        li.innerHTML = `
        <div class="li-details">
            <h4>${item.text}</h4>
            <small><i class="fa-solid fa-tag"></i> ${item.category}</small>
            <small><i class="fa-regular fa-calendar"></i> ${item.formattedDate}</small>
            <small><i class="fa-regular fa-clock"></i> ${item.formattedTime}</small>
        </div>
        <div class="li-actions">
            <h3 style="color:${item.type === "income" ? "var(--green-accent)" : "var(--red-accent)"}">
                ${item.type === "income" ? "+" : "-"}₹${item.amount.toFixed(2)}
            </h3>
            <button class="delete-btn" onclick="deleteTransaction(${item.id})" aria-label="Delete">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
        `;

        list.appendChild(li);
    });

    // Balances are computed off of global data arrays, not filtered arrays
    transactions.forEach(item => {
        if (item.type === "income") {
            totalIncome += item.amount;
        } else {
            totalExpense += item.amount;
        }
    });

    income.innerHTML = "₹" + totalIncome.toFixed(2);
    expense.innerHTML = "₹" + totalExpense.toFixed(2);
    balance.innerHTML = "₹" + (totalIncome - totalExpense).toFixed(2);

    updateReports();
}

// Secure Entry deletion matching safe timestamp IDs
function deleteTransaction(id) {
    if (confirm("Are you sure you want to delete this record?")) {
        transactions = transactions.filter(item => item.id !== id);
        saveData();
        applyFilterAndRender();
    }
}

// Compute Monthly/Yearly performance cards
function updateReports() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    let monthIncome = 0;
    let monthExpense = 0;
    let yearIncome = 0;
    let yearExpense = 0;

    transactions.forEach(item => {
        const d = new Date(item.date);
        const month = d.getMonth() + 1;
        const year = d.getFullYear();

        if (year === currentYear) {
            if (item.type === "income") {
                yearIncome += item.amount;
            } else {
                yearExpense += item.amount;
            }
            
            if (month === currentMonth) {
                if (item.type === "income") {
                    monthIncome += item.amount;
                } else {
                    monthExpense += item.amount;
                }
            }
        }
    });

    monthReport.innerHTML = `
        <b>Monthly Summary</b>
        🟢 Inc: ₹${monthIncome.toFixed(2)}<br>
        🔴 Exp: ₹${monthExpense.toFixed(2)}<br>
        💼 Bal: ₹${(monthIncome - monthExpense).toFixed(2)}
    `;

    yearReport.innerHTML = `
        <b>Yearly Summary</b>
        🟢 Inc: ₹${yearIncome.toFixed(2)}<br>
        🔴 Exp: ₹${yearExpense.toFixed(2)}<br>
        💼 Bal: ₹${(yearIncome - yearExpense).toFixed(2)}
    `;
}

// Composite Pipeline (Combines Live Search, Filter Selection and Sorting Type simultaneously)
function applyFilterAndRender() {
    let data = [...transactions];
    const keyword = search.value.toLowerCase().trim();

    // 1. Search Query Matcher
    if (keyword !== "") {
        data = data.filter(item =>
            item.text.toLowerCase().includes(keyword) ||
            item.category.toLowerCase().includes(keyword)
        );
    }

    // 2. Select Type Matcher
    if (filterType && filterType.value !== "all") {
        data = data.filter(item => item.type === filterType.value);
    }

    // 3. Select Sorter Matcher
    if (sortBy) {
        switch (sortBy.value) {
            case "high":
                data.sort((a, b) => b.amount - a.amount);
                break;
            case "low":
                data.sort((a, b) => a.amount - b.amount);
                break;
            case "oldest":
                data.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case "newest":
            default:
                data.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
        }
    }

    renderDOM(data);
}

// Input Pipeline Hooks
search.addEventListener("keyup", applyFilterAndRender);
if (filterType) filterType.addEventListener("change", applyFilterAndRender);
if (sortBy) sortBy.addEventListener("change", applyFilterAndRender);

// First Load Initializer
applyFilterAndRender();
