import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import SummaryCard from "./components/SummaryCard";
import TransactionItem from "./components/TransactionItem";
import AddTransactionForm from "./components/AddTransactionForm";
import SearchBar from "./components/SearchBar";
import ExpenseChart from "./components/ExpenseChart";

function App() {
  const user = {
    name: "Ram",
  };
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [transactions, setTransactions] = useState(() => {
  const savedTransactions = localStorage.getItem("transactions");
  return savedTransactions
    ? JSON.parse(savedTransactions)
    : [
        {
          id: 1,
          title: "Netflix",
          amount: 499,
          type: "Expense",
        },
        {
          id: 2,
          title: "Salary",
          amount: 50000,
          type: "Income",
        },
        {
          id: 3,
          title: "Swiggy",
          amount: 350,
          type: "Expense",
        },
        {
          id: 4,
          title: "Electricity Bill",
          amount: 1200,
          type: "Expense",
        },
      ];
});

  const addTransaction = (newTransaction) => {
    setTransactions((prevTransactions) => [
      ...prevTransactions,
      newTransaction,
    ]);
  };
  const deleteTransaction = (id) => {
  setTransactions((prevTransactions) =>
    prevTransactions.filter((transaction) => transaction.id !== id)
  );
};
const filteredTransactions = transactions.filter((transaction) => {

  const matchesSearch =
    transaction.title.toLowerCase().includes(search.toLowerCase());

  const matchesFilter =
    filter === "All" || transaction.type === filter;

  return matchesSearch && matchesFilter;

});
const totalIncome = transactions
  .filter((transaction) => transaction.type === "Income")
  .reduce((total, transaction) => total + transaction.amount, 0);

const totalExpense = transactions
  .filter((transaction) => transaction.type === "Expense")
  .reduce((total, transaction) => total + transaction.amount, 0);

const totalBalance = totalIncome - totalExpense;
useEffect(() => {
  console.log("Saving...", transactions);

  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );
}, [transactions]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-8 py-10">
        <h2 className="text-4xl font-bold">
          Welcome Back, {user.name} 👋
        </h2>

        <p className="text-zinc-400 mt-2">
          Manage your income and expenses with AI.
        </p>

        <div className="grid grid-cols-3 gap-6 mt-10">
         <SummaryCard
  title="Total Balance"
  amount={totalBalance.toLocaleString()}
/>

<SummaryCard
  title="Total Income"
  amount={totalIncome.toLocaleString()}
/>
<SummaryCard
  title="Total Expense"
  amount={totalExpense.toLocaleString()}
/>
        </div>
        <SearchBar
  search={search}
  setSearch={setSearch}
/>
<div className="flex gap-4 mt-4">

  <button
    onClick={() => setFilter("All")}
    className={`px-5 py-2 rounded-lg ${
      filter === "All"
        ? "bg-blue-600"
        : "bg-zinc-800"
    }`}
  >
    All
  </button>

  <button
    onClick={() => setFilter("Income")}
    className={`px-5 py-2 rounded-lg ${
      filter === "Income"
        ? "bg-green-600"
        : "bg-zinc-800"
    }`}
  >
    Income
  </button>

  <button
    onClick={() => setFilter("Expense")}
    className={`px-5 py-2 rounded-lg ${
      filter === "Expense"
        ? "bg-red-600"
        : "bg-zinc-800"
    }`}
  >
    Expense
  </button>

</div>

        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">
            Recent Transactions
          </h2>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            {filteredTransactions.map((transaction) => (
  <TransactionItem
  key={transaction.id}
  id={transaction.id}
  title={transaction.title}
  amount={transaction.amount}
  type={transaction.type}
  date={transaction.date}
  deleteTransaction={deleteTransaction}
/>
))}
          </div>
        </section>
        <ExpenseChart
  income={totalIncome}
  expense={totalExpense}
/>

        <AddTransactionForm addTransaction={addTransaction} />
      </main>
    </div>
  );
}

export default App;