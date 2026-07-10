const form = document.getElementById("transaction-form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const type = document.getElementById("type");

const list = document.getElementById("list");

const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Display Transactions
function showTransactions() {

    list.innerHTML = "";

    transactions.forEach((item, index) => {

        const li = document.createElement("li");

        li.classList.add(item.type);

        li.innerHTML = `
            <span>${item.text}</span>
            <span>₹${item.amount}</span>
            <button class="delete-btn" onclick="deleteTransaction(${index})">
                Delete
            </button>
        `;

        list.appendChild(li);

    });

    updateSummary();

}

// Update Balance
function updateSummary() {

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(item => {

        if (item.type === "income") {
            totalIncome += Number(item.amount);
        } else {
            totalExpense += Number(item.amount);
        }

    });

    income.innerText = "₹" + totalIncome.toFixed(2);
    expense.innerText = "₹" + totalExpense.toFixed(2);
    balance.innerText = "₹" + (totalIncome - totalExpense).toFixed(2);

    localStorage.setItem("transactions", JSON.stringify(transactions));

}

// Add Transaction
form.addEventListener("submit", function(e) {

    e.preventDefault();

    if (text.value === "" || amount.value === "") {
        alert("Please fill all fields");
        return;
    }

    transactions.push({
        text: text.value,
        amount: amount.value,
        type: type.value
    });

    text.value = "";
    amount.value = "";

    showTransactions();

});

// Delete Transaction
function deleteTransaction(index) {

    transactions.splice(index, 1);

    showTransactions();

}

// Initial Load
showTransactions();
