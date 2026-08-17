import { useState } from "react";

function AIInsights({
  transactions,
  profile,
  totalIncome,
  totalExpense,
  totalBalance,
}) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getInsights = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:6913"}/api/ai/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          transactions,
          totalIncome,
          totalExpense,
          totalBalance,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI request failed");

      setInsights(data);
    } catch (err) {
      console.error("AI INSIGHTS ERROR:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-10">
      <div className="bg-[#0c2420] border border-[#25483f] rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">🤖 AI Financial Insights</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Get spending analysis, budget advice and saving suggestions.
            </p>
          </div>

          <button
            onClick={getInsights}
            disabled={loading}
            className="bg-emerald-500 text-[#061a16] hover:bg-emerald-400 disabled:opacity-50 px-5 py-3 rounded-lg font-semibold"
          >
            {loading ? "Analyzing..." : "Analyze My Finances"}
          </button>
        </div>

        {error && (
          <div className="mt-5 rounded-lg border border-red-900 bg-red-950/40 p-4 text-red-300">
            {error}
          </div>
        )}

        {insights && (
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-[#061a16] border border-[#25483f] rounded-xl p-5 md:col-span-2">
              <p className="text-sm text-zinc-500">AI Summary</p>
              <p className="mt-2 text-zinc-200 leading-7">{insights.summary}</p>
            </div>

            <div className="bg-[#061a16] border border-[#25483f] rounded-xl p-5">
              <p className="font-semibold">💡 Recommendations</p>
              <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                {(insights.recommendations || []).map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-[#061a16] border border-[#25483f] rounded-xl p-5">
              <p className="font-semibold">⚠️ Alerts</p>
              <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                {(insights.alerts || []).length ? (
                  insights.alerts.map((item, index) => <li key={index}>• {item}</li>)
                ) : (
                  <li className="text-green-400">No major spending alerts.</li>
                )}
              </ul>
            </div>

            {insights.savingTip && (
              <div className="md:col-span-2 bg-emerald-950/30 border border-emerald-900 rounded-xl p-5">
                <p className="font-semibold text-green-400">🎯 Saving Tip</p>
                <p className="mt-2 text-zinc-300">{insights.savingTip}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default AIInsights;
