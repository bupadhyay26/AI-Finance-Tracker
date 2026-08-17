import { useEffect, useState } from "react";
import {
  getTransactions,
  addTransaction as addTransactionApi,
  deleteTransaction as deleteTransactionApi,
} from "./api/transactionAPI";
import Navbar from "./components/Navbar";
import SummaryCard from "./components/SummaryCard";
import TransactionItem from "./components/TransactionItem";
import AddTransactionForm from "./components/AddTransactionForm";
import SearchBar from "./components/SearchBar";
import ExpenseChart from "./components/ExpenseChart";
import Profile from "./components/Profile";
import QuickAdd from "./components/QuickAdd";
import BankStatement from "./components/BankStatement";
import AIInsights from "./components/AIInsights";
import LoanManager from "./components/LoanManager";
import {
  enableNotifications,
  initNotificationScheduling,
  notificationsEnabled,
  notificationsSupported,
  registerServiceWorker,
} from "./notifications";

const PROFILE_KEY = "ai_finance_tracker_profile";
const REVIEW_KEY = "ai_finance_tracker_salary_review";
const LOANS_KEY = "pocketiq_loans";

function readProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
  } catch {
    return null;
  }
}

function App() {
  const [profile, setProfile] = useState(() => readProfile());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LOANS_KEY) || "[]"); } catch { return []; }
  });
  const [showProfile, setShowProfile] = useState(false);
  const [showSalaryReview, setShowSalaryReview] = useState(false);
  const [newSalary, setNewSalary] = useState("");
  const [salaryReviewMessage, setSalaryReviewMessage] = useState("");
  const [notificationsOn, setNotificationsOn] = useState(() => notificationsEnabled());

  const occupation = profile?.occupation || "Working Professional";
  const profileSalary = Number(profile?.monthlySalary) || 0;
  const studentIncome =
    Number(profile?.monthlyAllowance) +
    Number(profile?.partTimeIncome) +
    Number(profile?.scholarship) +
    Number(profile?.otherIncome) || 0;
  const profileIncome = occupation === "Student" ? studentIncome : profileSalary;
  const currentMoney = Number(profile?.currentMoney) || 0;
  const profileName = profile?.name || "Ram";

  const addTransaction = async (newTransaction) => {
    await addTransactionApi(newTransaction);
    const data = await getTransactions();
    setTransactions(data);
  };

  const persistLoans = (nextLoans) => {
    setLoans(nextLoans);
    localStorage.setItem(LOANS_KEY, JSON.stringify(nextLoans));
  };

  const addLoan = async ({ direction, person, original }) => {
    const amount = Number(original);
    if (!person?.trim() || !Number.isFinite(amount) || amount <= 0) {
      throw new Error("Invalid money lent/borrowed entry.");
    }

    const nextLoan = {
      id: `loan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      direction,
      person: person.trim(),
      original: amount,
      settled: 0,
      remaining: amount,
      createdAt: new Date().toISOString(),
    };

    persistLoans([nextLoan, ...loans]);
  };

  const repayLoan = (id, repaymentAmount) => {
    const amount = Number(repaymentAmount);
    const nextLoans = loans.map((loan) => {
      if (loan.id !== id) return loan;
      const remaining = Math.max(Number(loan.remaining || 0) - amount, 0);
      return {
        ...loan,
        settled: Number(loan.settled || 0) + amount,
        remaining,
      };
    });
    persistLoans(nextLoans);
  };

  const deleteTransaction = async (id) => {
    try {
      await deleteTransactionApi(id);
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("DELETE ERROR:", error);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const title = String(transaction.title || "").toLowerCase();
    const matchesSearch = title.includes(search.toLowerCase());
    const matchesFilter =
      filter === "All" ||
      String(transaction.type || "").toLowerCase() === filter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const transactionIncome = transactions
    .filter(
      (transaction) =>
        String(transaction.type || "").toLowerCase() === "income"
    )
    .reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0
    );

  // Recurring profile income is treated as monthly income. Students use their optional income sources.
  const totalIncome = profileIncome + transactionIncome;

  const totalExpense = transactions
    .filter(
      (transaction) =>
        String(transaction.type || "").toLowerCase() === "expense"
    )
    .reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0
    );

  const lentOriginal = loans
    .filter((loan) => loan.direction === "lent")
    .reduce((sum, loan) => sum + Number(loan.original || 0), 0);
  const lentReceived = loans
    .filter((loan) => loan.direction === "lent")
    .reduce((sum, loan) => sum + Number(loan.settled || 0), 0);
  const borrowedOriginal = loans
    .filter((loan) => loan.direction === "borrowed")
    .reduce((sum, loan) => sum + Number(loan.original || 0), 0);
  const borrowedPaid = loans
    .filter((loan) => loan.direction === "borrowed")
    .reduce((sum, loan) => sum + Number(loan.settled || 0), 0);

  // Lent money leaves the user's cash; returned money comes back.
  // Borrowed money enters cash; repayments leave cash.
  const loanCashAdjustment =
    -lentOriginal + lentReceived + borrowedOriginal - borrowedPaid;

  // Total Balance = starting/current money + income - expenses + loan cash movements.
  const totalBalance = currentMoney + totalIncome - totalExpense + loanCashAdjustment;

  useEffect(() => {
    registerServiceWorker();
    initNotificationScheduling();

    const fetchTransactions = async () => {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("FETCH ERROR:", error);
      }
    };

    fetchTransactions();
  }, []);

  // Ask on the 1st and 5th of every month whether regular income changed.
  // Students are included: the prompt can update their monthly allowance.
  useEffect(() => {
    const now = new Date();
    const day = now.getDate();
    if (day !== 1 && day !== 5) return;

    const reviewId = `${now.getFullYear()}-${now.getMonth() + 1}-${day}-${occupation}`;
    if (localStorage.getItem(REVIEW_KEY) === reviewId) return;

    const currentIncome = occupation === "Student"
      ? Number(profile?.monthlyAllowance || 0)
      : Number(profile?.monthlySalary || 0);

    setNewSalary(String(currentIncome));
    setSalaryReviewMessage("");
    setShowSalaryReview(true);
  }, [profile, occupation]);

  const handleEnableNotifications = async () => {
    if (!notificationsSupported()) {
      window.alert("Notifications are not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    try {
      await enableNotifications();
      setNotificationsOn(true);
    } catch (error) {
      console.error("NOTIFICATION ERROR:", error);
      window.alert(error.message || "Could not enable notifications.");
    }
  };

  const finishSalaryReview = (updatedSalary) => {
    const now = new Date();
    const reviewId = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${occupation}`;

    if (updatedSalary !== null) {
      const income = Number(updatedSalary);
      if (!Number.isFinite(income) || income < 0) {
        setSalaryReviewMessage("Please enter a valid amount.");
        return;
      }

      const nextProfile = { ...(profile || {}) };
      if (occupation === "Student") {
        nextProfile.monthlyAllowance = String(income);
      } else {
        nextProfile.monthlySalary = String(income);
      }

      localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
      setProfile(nextProfile);
    }

    localStorage.setItem(REVIEW_KEY, reviewId);
    setShowSalaryReview(false);
  };

  return (
    <div className="min-h-screen bg-[#061a16] text-white">
      <Navbar
        profileName={profileName}
        onProfile={() => setShowProfile(true)}
        notificationsOn={notificationsOn}
        onEnableNotifications={handleEnableNotifications}
      />

      <main className="max-w-6xl mx-auto px-8 py-10">
        <h2 className="text-4xl font-bold">
          Welcome Back, {profileName} 👋
        </h2>

        <p className="text-zinc-400 mt-2">
          Manage your income and expenses with AI.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-10">
          <SummaryCard
            title="Total Balance"
            amount={totalBalance.toLocaleString("en-IN")}
          />
          <SummaryCard
            title="Money You Have Now"
            amount={currentMoney.toLocaleString("en-IN")}
          />
          <SummaryCard
            title="Total Income"
            amount={totalIncome.toLocaleString("en-IN")}
          />
          <SummaryCard
            title="Total Expense"
            amount={totalExpense.toLocaleString("en-IN")}
          />
          <SummaryCard
            title="To Receive"
            amount={loans.filter((loan) => loan.direction === "lent").reduce((sum, loan) => sum + Number(loan.remaining || 0), 0).toLocaleString("en-IN")}
          />
          <SummaryCard
            title="To Pay"
            amount={loans.filter((loan) => loan.direction === "borrowed").reduce((sum, loan) => sum + Number(loan.remaining || 0), 0).toLocaleString("en-IN")}
          />
        </div>

        <SearchBar search={search} setSearch={setSearch} />

        <div className="flex gap-4 mt-4 flex-wrap">
          <button
            onClick={() => setFilter("All")}
            className={`px-5 py-2 rounded-lg ${
              filter === "All" ? "bg-emerald-500 text-[#061a16]" : "bg-[#17352f]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("Income")}
            className={`px-5 py-2 rounded-lg ${
              filter === "Income" ? "bg-green-600" : "bg-[#17352f]"
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setFilter("Expense")}
            className={`px-5 py-2 rounded-lg ${
              filter === "Expense" ? "bg-red-600" : "bg-[#17352f]"
            }`}
          >
            Expense
          </button>
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Recent Transactions</h2>

          <div className="bg-[#0c2420] border border-[#25483f] rounded-xl p-6">
            {filteredTransactions.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">
                No transactions found.
              </p>
            ) : (
              filteredTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  id={transaction.id}
                  title={transaction.title}
                  amount={transaction.amount}
                  type={transaction.type}
                  date={
                    transaction.created_at
                      ? new Date(
                          transaction.created_at
                        ).toLocaleDateString("en-IN")
                      : "-"
                  }
                  deleteTransaction={deleteTransaction}
                />
              ))
            )}
          </div>
        </section>

        <ExpenseChart income={totalIncome} expense={totalExpense} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
          <QuickAdd addTransaction={addTransaction} addLoan={addLoan} />
          <BankStatement addTransaction={addTransaction} />
        </div>

        <LoanManager loans={loans} repayLoan={repayLoan} />

        <AddTransactionForm addTransaction={addTransaction} />

        <AIInsights
          transactions={transactions}
          profile={profile}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          totalBalance={totalBalance}
        />
      </main>

      <Profile
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        totalExpense={totalExpense}
        onProfileChange={(nextProfile) => {
          setProfile(nextProfile);
        }}
      />

      {showSalaryReview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#02100d]/80 p-4">
          <div className="w-full max-w-md bg-[#061a16] border border-[#25483f] rounded-2xl p-6 shadow-2xl">
            <div className="text-3xl mb-3">💰</div>
            <h2 className="text-2xl font-bold">
              {occupation === "Student" ? "Income update?" : "Salary update?"}
            </h2>
            <p className="text-zinc-400 mt-2">
              {occupation === "Student"
                ? "It is your monthly income check. Did your allowance or regular income change?"
                : "It is a salary-review date. Did you receive any increment this month?"}
            </p>

            <label className="block text-sm text-zinc-400 mt-5 mb-2">
              {occupation === "Student" ? "Current monthly allowance / income" : "Current monthly salary"}
            </label>
            <input
              type="number"
              min="0"
              value={newSalary}
              onChange={(e) => setNewSalary(e.target.value)}
              className="w-full bg-[#0c2420] border border-[#25483f] p-3 rounded-lg outline-none"
            />

            {salaryReviewMessage && (
              <p className="text-green-400 text-sm mt-3">
                {salaryReviewMessage}
              </p>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => finishSalaryReview(newSalary)}
                className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg font-semibold"
              >
                Yes, update
              </button>
              <button
                onClick={() => finishSalaryReview(null)}
                className="flex-1 bg-[#17352f] hover:bg-[#23483e] px-4 py-3 rounded-lg font-semibold"
              >
                No change
              </button>
            </div>

            <button
              onClick={() => setShowSalaryReview(false)}
              className="w-full mt-3 text-sm text-zinc-500 hover:text-white"
            >
              Remind me later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
