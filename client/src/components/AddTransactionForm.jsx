import { useCallback, useMemo, useRef, useState } from "react";

const TITLE_MAX_LENGTH = 50;

function AddTransactionForm({ addTransaction }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Expense");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [touched, setTouched] = useState({ title: false, amount: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const trimmedTitle = title.trim();
  const parsedAmount = Number(amount);

  const fieldErrors = useMemo(() => {
    const nextErrors = { title: "", amount: "" };

    if (!trimmedTitle) {
      nextErrors.title = "Title is required";
    } else if (title.length > TITLE_MAX_LENGTH) {
      nextErrors.title = `Title must be ${TITLE_MAX_LENGTH} characters or fewer`;
    }

    if (amount === "" || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      nextErrors.amount = "Amount must be greater than 0";
    }

    return nextErrors;
  }, [title, trimmedTitle, amount, parsedAmount]);

  const isFormValid = useMemo(
    () => !fieldErrors.title && !fieldErrors.amount,
    [fieldErrors]
  );

  const visibleErrors = useMemo(
    () => ({
      title: touched.title ? fieldErrors.title : "",
      amount: touched.amount ? fieldErrors.amount : "",
    }),
    [touched, fieldErrors]
  );

  const titleDescribedBy = [
    "title-count",
    visibleErrors.title ? "title-error" : null,
  ]
    .filter(Boolean)
    .join(" ");

  const resetForm = useCallback(() => {
    setTitle("");
    setAmount("");
    setType("Expense");
    setDate(new Date().toISOString().split("T")[0]);
    setTouched({ title: false, amount: false });
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      setTouched({ title: true, amount: true });

      if (!isFormValid || isSubmittingRef.current) return;

      isSubmittingRef.current = true;
      setIsSubmitting(true);

      try {
        addTransaction({
          id: Date.now(),
          title: trimmedTitle,
          amount: parsedAmount,
          type,
          date,
        });
        resetForm();
      } finally {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [
      isFormValid,
      addTransaction,
      trimmedTitle,
      parsedAmount,
      type,
      date,
      resetForm,
    ]
  );

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">
        Add Transaction
      </h2>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <form noValidate onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              id="transaction-title"
              type="text"
              name="title"
              placeholder="Transaction Title"
              value={title}
              maxLength={TITLE_MAX_LENGTH}
              aria-invalid={Boolean(visibleErrors.title)}
              aria-describedby={titleDescribedBy}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() =>
                setTouched((prev) => ({ ...prev, title: true }))
              }
              className="w-full bg-zinc-800 p-3 rounded-lg outline-none"
            />
            <p
              id="title-count"
              className="mt-1 text-sm text-zinc-400"
              aria-live="polite"
            >
              {title.length}/{TITLE_MAX_LENGTH}
            </p>
            {visibleErrors.title && (
              <p id="title-error" className="mt-1 text-sm text-red-400">
                {visibleErrors.title}
              </p>
            )}
          </div>

          <div className="mb-4">
            <input
              id="transaction-amount"
              type="number"
              name="amount"
              placeholder="Amount"
              value={amount}
              min="0"
              step="any"
              aria-invalid={Boolean(visibleErrors.amount)}
              aria-describedby={
                visibleErrors.amount ? "amount-error" : undefined
              }
              onChange={(e) => setAmount(e.target.value)}
              onBlur={() =>
                setTouched((prev) => ({ ...prev, amount: true }))
              }
              className="w-full bg-zinc-800 p-3 rounded-lg outline-none"
            />
            {visibleErrors.amount && (
              <p id="amount-error" className="mt-1 text-sm text-red-400">
                {visibleErrors.amount}
              </p>
            )}
          </div>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-zinc-800 p-3 rounded-lg mb-4 outline-none"
          >
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-zinc-800 p-3 rounded-lg mb-4 outline-none"
          />

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            aria-busy={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded-lg font-semibold"
          >
            Add Transaction
          </button>
        </form>
      </div>
    </section>
  );
}

export default AddTransactionForm;
