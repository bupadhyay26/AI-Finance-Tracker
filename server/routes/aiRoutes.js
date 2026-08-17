import express from "express";

const router = express.Router();

function localInsights({ profile = {}, transactions = [], totalIncome = 0, totalExpense = 0, totalBalance = 0 }) {
  const expenses = transactions.filter(
    (t) => String(t.type || "").toLowerCase() === "expense"
  );

  const byCategory = {};
  for (const transaction of expenses) {
    const key = transaction.title || "Other";
    byCategory[key] = (byCategory[key] || 0) + Number(transaction.amount || 0);
  }

  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  const savingGoal = Number(profile.monthlySavingGoal || 0);
  const plannedSpending = Math.max(Number(profile.monthlySalary || 0) - savingGoal, 0);
  const remaining = plannedSpending - Number(totalExpense || 0);

  const recommendations = [];
  const alerts = [];

  if (savingGoal > 0 && Number(totalIncome) > 0) {
    const rate = (savingGoal / Number(totalIncome)) * 100;
    recommendations.push(`Your current saving target is about ${rate.toFixed(0)}% of monthly income.`);
  }

  if (topCategory) {
    recommendations.push(`${topCategory[0]} is your largest recorded expense category at ₹${topCategory[1].toLocaleString("en-IN")}.`);
  }

  if (remaining < 0) {
    alerts.push(`You are ₹${Math.abs(remaining).toLocaleString("en-IN")} above your planned monthly spending.`);
  }

  if (Number(totalExpense) > Number(totalIncome) && Number(totalIncome) > 0) {
    alerts.push("Your recorded expenses are higher than your current income.");
  }

  if (!recommendations.length) {
    recommendations.push("Add a few transactions and a saving goal for more personalized analysis.");
  }

  return {
    source: "local-fallback",
    summary: `You currently have ₹${Number(totalBalance).toLocaleString("en-IN")} balance after ₹${Number(totalExpense).toLocaleString("en-IN")} in recorded expenses.`,
    recommendations,
    alerts,
    savingTip:
      savingGoal > 0
        ? `Try to keep monthly spending within ₹${plannedSpending.toLocaleString("en-IN")} to protect your saving goal.`
        : "Set a monthly saving goal in your profile to receive a more targeted saving plan.",
  };
}

function extractOutputText(data) {
  if (typeof data.output_text === "string") return data.output_text;

  const texts = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") texts.push(content.text);
    }
  }
  return texts.join("\n").trim();
}

function parseJson(text) {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned);
}

router.post("/insights", async (req, res) => {
  const payload = req.body || {};

  if (!process.env.OPENAI_API_KEY) {
    return res.json(localInsights(payload));
  }

  try {
    const model = process.env.OPENAI_MODEL || "gpt-5-mini";

    const prompt = `
You are a personal finance analysis assistant.
Analyze the user's finance data. Do not invent transactions.
Return ONLY valid JSON with exactly these keys:
summary (string),
recommendations (array of 3 short strings),
alerts (array of short strings),
savingTip (string).

User profile:
${JSON.stringify(payload.profile || {})}

Totals:
${JSON.stringify({
  totalIncome: payload.totalIncome,
  totalExpense: payload.totalExpense,
  totalBalance: payload.totalBalance,
})}

Transactions:
${JSON.stringify(payload.transactions || [])}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        input: prompt,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return res.json(localInsights(payload));
    }

    const text = extractOutputText(data);
    if (!text) return res.json(localInsights(payload));

    try {
      return res.json({ source: "openai", ...parseJson(text) });
    } catch {
      return res.json({
        source: "openai",
        summary: text,
        recommendations: [],
        alerts: [],
        savingTip: "Review your biggest expense categories before the next month.",
      });
    }
  } catch (error) {
    console.error("AI INSIGHTS ERROR:", error);
    return res.json(localInsights(payload));
  }
});

export default router;
