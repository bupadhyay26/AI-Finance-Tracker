import { useEffect, useRef, useState } from "react";

const quickOptions = [
  { title: "Food", type: "Expense", icon: "🍔" },
  { title: "Travel", type: "Expense", icon: "🚕" },
  { title: "Shopping", type: "Expense", icon: "🛍️" },
  { title: "Bills", type: "Expense", icon: "💡" },
  { title: "Salary", type: "Income", icon: "💰" },
];

const loanOptions = [
  { title: "Money Lent", direction: "lent", icon: "💸", helper: "I gave someone money" },
  { title: "Money Borrowed", direction: "borrowed", icon: "💰", helper: "I received money from someone" },
];

const incomeWords = ["salary", "income", "bonus", "allowance", "scholarship", "refund"];
const typeAliases = {
  food: "Food", meal: "Food", lunch: "Food", dinner: "Food", breakfast: "Food",
  travel: "Travel", transport: "Travel", shopping: "Shopping", shop: "Shopping",
  bills: "Bills", bill: "Bills", rent: "Bills", salary: "Salary",
};

function parseVoiceCommand(text) {
  const cleaned = text.toLowerCase().replace(/[₹,]/g, " ").replace(/\s+/g, " ").trim();
  const amountMatch = cleaned.match(/(?:^|\s)(\d+(?:\.\d+)?)\s*(?:rupees?|rs\.?|inr)?\s*$/i);
  if (!amountMatch) return null;

  const amount = Number(amountMatch[1]);
  const phrase = cleaned.slice(0, amountMatch.index).trim();
  if (!amount || amount <= 0 || !phrase) return null;

  const words = phrase.split(" ").filter(Boolean);
  const meaningfulWords = words.filter(
    (word) => !["add", "expense", "income", "spent", "spend", "for", "on", "of", "my"].includes(word)
  );

  const matchedAlias = meaningfulWords.find((word) => typeAliases[word]);
  const title = matchedAlias
    ? typeAliases[matchedAlias]
    : meaningfulWords.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

  if (!title) return null;

  const isIncome =
    incomeWords.some((word) => meaningfulWords.includes(word)) ||
    title.toLowerCase() === "salary";

  return { title, amount, type: isIncome ? "Income" : "Expense" };
}

function QuickAdd({ addTransaction, addLoan }) {
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [person, setPerson] = useState("");
  const [saving, setSaving] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceStatus, setVoiceStatus] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const handleQuickAdd = (option) => {
    setSelected(option);
    setAmount("");
    setPerson("");
  };

  const handleLoanAdd = (option) => {
    setSelected(option);
    setAmount("");
    setPerson("");
  };

  const save = async (transaction) => {
    if (!transaction?.title || !transaction?.amount || saving) return;
    setSaving(true);
    try {
      await addTransaction({
        ...transaction,
        date: new Date().toISOString().split("T")[0],
      });
      setSelected(null);
      setAmount("");
      setVoiceText("");
      setVoiceStatus(`Added ${transaction.title} — ₹${transaction.amount.toLocaleString("en-IN")}`);
    } catch (error) {
      console.error("Quick add error:", error);
      setVoiceStatus("Could not add the transaction. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const saveLoan = async (e) => {
    e.preventDefault();
    const value = Number(amount);
    const name = person.trim();
    if (!selected || !["lent", "borrowed"].includes(selected.direction) || !value || value <= 0 || !name || saving) return;

    setSaving(true);
    try {
      await addLoan({
        direction: selected.direction,
        person: name,
        original: value,
      });
      setSelected(null);
      setAmount("");
      setPerson("");
      setVoiceStatus(
        `${selected.title}: ₹${value.toLocaleString("en-IN")} with ${name}. Remaining ₹${value.toLocaleString("en-IN")}.`
      );
    } catch (error) {
      console.error("Loan add error:", error);
      setVoiceStatus("Could not save this entry. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const saveManual = async (e) => {
    e.preventDefault();
    const value = Number(amount);
    if (!selected || !value || value <= 0) return;
    await save({ title: selected.title, amount: value, type: selected.type });
  };

  const startVoiceAssistant = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus("Voice input is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceStatus('Listening... say something like "food 500"');
    };
    recognition.onresult = async (event) => {
      const spokenText = event.results[0][0].transcript;
      setVoiceText(spokenText);
      const transaction = parseVoiceCommand(spokenText);
      if (!transaction) {
        setVoiceStatus('Could not understand that. Try "food 500", "travel 300" or "salary 50000".');
        return;
      }
      setVoiceStatus(`Adding ${transaction.title} — ₹${transaction.amount.toLocaleString("en-IN")}...`);
      await save(transaction);
    };
    recognition.onerror = (event) => {
      console.error("Voice assistant error:", event.error);
      setVoiceStatus(
        event.error === "not-allowed"
          ? "Microphone permission was blocked. Allow microphone access and try again."
          : "Voice input failed. Please try again."
      );
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const isLoan = selected?.direction === "lent" || selected?.direction === "borrowed";

  return (
    <section className="bg-[#0c2420] border border-[#25483f] rounded-xl p-6 h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">⚡ Quick Add</h2>
        <p className="text-sm text-zinc-500 mt-1">Add common transactions or manage money lent/borrowed.</p>
      </div>

      <div className="bg-[#061a16] border border-[#25483f] rounded-xl p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="font-semibold">🎙️ Voice Assistant</p>
            <p className="text-xs text-zinc-500 mt-1">Say: &quot;food 500&quot; or &quot;salary 50000&quot;</p>
          </div>
          <button
            type="button"
            onClick={startVoiceAssistant}
            disabled={saving}
            className={`px-5 py-3 rounded-lg font-semibold transition ${
              isListening ? "bg-red-600 hover:bg-red-700" : "bg-emerald-500 text-[#061a16] hover:bg-emerald-400"
            } disabled:opacity-50`}
          >
            {isListening ? "🛑 Stop" : "🎙️ Speak"}
          </button>
        </div>
        {voiceText && <p className="text-sm text-zinc-300 mt-3">Heard: <span className="font-semibold">{voiceText}</span></p>}
        {voiceStatus && <p className="text-xs text-zinc-400 mt-2">{voiceStatus}</p>}
      </div>

      <p className="text-sm font-semibold text-emerald-300 mb-2">Regular transactions</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {quickOptions.map((option) => (
          <button
            key={option.title}
            type="button"
            onClick={() => handleQuickAdd(option)}
            className="bg-[#17352f] border border-[#31584e] hover:border-zinc-500 rounded-xl p-4 text-left transition"
          >
            <div className="text-2xl">{option.icon}</div>
            <div className="font-semibold mt-2">{option.title}</div>
            <div className={`text-xs mt-1 ${option.type === "Income" ? "text-green-400" : "text-red-400"}`}>{option.type}</div>
          </button>
        ))}
      </div>

      <p className="text-sm font-semibold text-emerald-300 mt-6 mb-2">Money tracking</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {loanOptions.map((option) => (
          <button
            key={option.direction}
            type="button"
            onClick={() => handleLoanAdd(option)}
            className="bg-[#17352f] border border-[#31584e] hover:border-emerald-500 rounded-xl p-4 text-left transition"
          >
            <div className="text-2xl">{option.icon}</div>
            <div className="font-semibold mt-2">{option.title}</div>
            <div className="text-xs text-zinc-500 mt-1">{option.helper}</div>
          </button>
        ))}
      </div>

      {selected && (
        <form
          onSubmit={isLoan ? saveLoan : saveManual}
          className="mt-4 bg-[#061a16] border border-[#25483f] rounded-xl p-4"
        >
          <p className="text-sm text-zinc-400 mb-3">
            {selected.icon} {selected.title}
          </p>

          {isLoan && (
            <input
              autoFocus
              type="text"
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              placeholder={selected.direction === "lent" ? "Person name (e.g. Rahul)" : "Person name (e.g. Amit)"}
              className="w-full bg-[#17352f] p-3 rounded-lg outline-none mb-3"
            />
          )}

          <div className="flex gap-3">
            <input
              autoFocus={!isLoan}
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="flex-1 bg-[#17352f] p-3 rounded-lg outline-none"
            />
            <button
              type="submit"
              disabled={!amount || (isLoan && !person.trim()) || saving}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-5 py-3 rounded-lg font-semibold"
            >
              {saving ? "Saving..." : isLoan ? "Save" : "Add"}
            </button>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="bg-[#17352f] hover:bg-[#23483e] px-5 py-3 rounded-lg"
            >
              Cancel
            </button>
          </div>
          {isLoan && (
            <p className="text-xs text-zinc-500 mt-3">
              Only the person and original amount are required. PocketIQ tracks the remaining amount automatically.
            </p>
          )}
        </form>
      )}
    </section>
  );
}

export default QuickAdd;
