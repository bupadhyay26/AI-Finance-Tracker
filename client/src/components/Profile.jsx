import { useEffect, useMemo, useState } from "react";

const PROFILE_KEY = "ai_finance_tracker_profile";
const SESSION_KEY = "ai_finance_tracker_signed_in";

const emptyProfile = {
  name: "",
  email: "",
  occupation: "",
  jobTitle: "",
  company: "",
  monthlySalary: "",
  currentMoney: "",
  monthlyAllowance: "",
  partTimeIncome: "",
  scholarship: "",
  otherIncome: "",
  monthlySavingGoal: "",
};

const inputClass =
  "w-full bg-[#0c2420] border border-[#25483f] p-3 rounded-lg outline-none focus:border-green-500 transition";

function Profile({ isOpen, onClose, totalExpense = 0, onProfileChange }) {
  const [profile, setProfile] = useState(emptyProfile);
  const [draft, setDraft] = useState(emptyProfile);
  const [signedIn, setSignedIn] = useState(false);
  const [view, setView] = useState("profile");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    try {
      const savedProfile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
      const savedSession = localStorage.getItem(SESSION_KEY) === "true";
      const nextProfile = { ...emptyProfile, ...(savedProfile || {}) };
      // Old profiles remain compatible; infer the old setup as a working profile.
      if (!nextProfile.occupation) nextProfile.occupation = nextProfile.monthlySalary ? "Working Professional" : "Student";
      setProfile(nextProfile);
      setDraft(nextProfile);
      setSignedIn(savedSession);
      setView(savedSession ? "profile" : "signin");
      setMessage("");
    } catch {
      setProfile(emptyProfile);
      setDraft(emptyProfile);
      setSignedIn(false);
      setView("signin");
    }
  }, [isOpen]);

  const occupation = profile.occupation || "Student";
  const isStudent = occupation === "Student";
  const salary = Number(profile.monthlySalary) || 0;
  const studentIncome =
    Number(profile.monthlyAllowance || 0) +
    Number(profile.partTimeIncome || 0) +
    Number(profile.scholarship || 0) +
    Number(profile.otherIncome || 0);
  const monthlyIncome = isStudent ? studentIncome : salary;
  const savingGoal = Number(profile.monthlySavingGoal) || 0;
  const plannedSpending = Math.max(monthlyIncome - savingGoal, 0);
  const remainingBudget = plannedSpending - Number(totalExpense || 0);
  const savingRate = monthlyIncome > 0 ? Math.min((savingGoal / monthlyIncome) * 100, 100) : 0;

  const budgetStatus = useMemo(() => {
    if (!monthlyIncome) return "Add your income details and saving goal to see your budget.";
    if (remainingBudget < 0) return `You are ₹${Math.abs(remainingBudget).toLocaleString("en-IN")} over your planned monthly spending.`;
    return `You have ₹${remainingBudget.toLocaleString("en-IN")} left in your planned spending budget.`;
  }, [monthlyIncome, remainingBudget]);

  if (!isOpen) return null;

  const handleDraftChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const validateDraft = () => {
    if (!draft.name.trim() || !draft.email.trim() || !draft.occupation) {
      return "Name, email and occupation are required.";
    }
    const numericFields = ["monthlySalary", "currentMoney", "monthlyAllowance", "partTimeIncome", "scholarship", "otherIncome", "monthlySavingGoal"];
    for (const field of numericFields) {
      if (draft[field] !== "" && (!Number.isFinite(Number(draft[field])) || Number(draft[field]) < 0)) {
        return "Income and saving amounts must be valid non-negative numbers.";
      }
    }
    return "";
  };

  const normalizeProfile = () => ({
    ...draft,
    name: draft.name.trim(),
    email: draft.email.trim(),
    occupation: draft.occupation,
    jobTitle: draft.jobTitle.trim(),
    company: draft.company.trim(),
    monthlySalary: draft.occupation === "Student" ? "" : draft.monthlySalary,
  });

  const handleSignIn = (e) => {
    e.preventDefault();
    const error = validateDraft();
    if (error) { setMessage(error); return; }
    const nextProfile = normalizeProfile();
    localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
    localStorage.setItem(SESSION_KEY, "true");
    setProfile(nextProfile); setDraft(nextProfile); setSignedIn(true); setView("profile");
    onProfileChange?.(nextProfile); setMessage("Profile saved successfully.");
  };

  const handleSave = (e) => {
    e.preventDefault();
    const error = validateDraft();
    if (error) { setMessage(error); return; }
    const nextProfile = normalizeProfile();
    localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
    setProfile(nextProfile); setDraft(nextProfile); setView("profile");
    onProfileChange?.(nextProfile); setMessage("Profile updated successfully.");
  };

  const handleSignOut = () => {
    localStorage.removeItem(SESSION_KEY);
    setSignedIn(false); setView("signin"); setMessage("You have been signed out.");
  };

  const incomeLabel = isStudent ? "Monthly Student Income" : "Monthly Income";

  const form = (
    <form onSubmit={signedIn ? handleSave : handleSignIn} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Name <span className="text-green-400">*</span></label>
          <input required name="name" value={draft.name} onChange={handleDraftChange} placeholder="Your name" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Email <span className="text-green-400">*</span></label>
          <input required name="email" type="email" value={draft.email} onChange={handleDraftChange} placeholder="you@example.com" className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-2">Occupation <span className="text-green-400">*</span></label>
        <select required name="occupation" value={draft.occupation} onChange={handleDraftChange} className={inputClass}>
          <option value="">Select occupation</option>
          <option value="Student">Student</option>
          <option value="Working Professional">Working Professional</option>
          <option value="Freelancer">Freelancer</option>
          <option value="Business Owner">Business Owner</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-4">
        <p className="font-semibold text-emerald-300">💰 Money you have right now</p>
        <p className="text-xs text-zinc-500 mt-1">Enter the money currently available with you. This is added to your income and expenses when calculating Total Balance.</p>
        <input name="currentMoney" type="number" min="0" value={draft.currentMoney} onChange={handleDraftChange} placeholder="15000" className={`${inputClass} mt-3`} />
      </div>

      {draft.occupation === "Student" ? (
        <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4">
          <div className="mb-4">
            <p className="font-semibold text-green-300">🎓 Student income</p>
            <p className="text-xs text-zinc-500 mt-1">Salary is not required. Add only the income sources you actually have.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {["monthlyAllowance", "partTimeIncome", "scholarship", "otherIncome"].map((field) => {
              const labels = { monthlyAllowance: "Monthly Allowance (₹)", partTimeIncome: "Part-time Income (₹)", scholarship: "Scholarship (₹)", otherIncome: "Other Income (₹)" };
              const placeholders = { monthlyAllowance: "5000", partTimeIncome: "0", scholarship: "0", otherIncome: "0" };
              return <div key={field}><label className="block text-sm text-zinc-400 mb-2">{labels[field]}</label><input name={field} type="number" min="0" value={draft[field]} onChange={handleDraftChange} placeholder={placeholders[field]} className={inputClass} /></div>;
            })}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">{incomeLabel} (₹)</label>
            <input name="monthlySalary" type="number" min="0" value={draft.monthlySalary} onChange={handleDraftChange} placeholder="50000" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Monthly Saving Goal (₹)</label>
            <input name="monthlySavingGoal" type="number" min="0" value={draft.monthlySavingGoal} onChange={handleDraftChange} placeholder="20000" className={inputClass} />
          </div>
        </div>
      )}

      {draft.occupation === "Student" && <div><label className="block text-sm text-zinc-400 mb-2">Monthly Saving Goal (₹)</label><input name="monthlySavingGoal" type="number" min="0" value={draft.monthlySavingGoal} onChange={handleDraftChange} placeholder="1000" className={inputClass} /></div>}

      <div className="grid md:grid-cols-2 gap-4">
        <div><label className="block text-sm text-zinc-400 mb-2">Job / Course</label><input name="jobTitle" value={draft.jobTitle} onChange={handleDraftChange} placeholder={draft.occupation === "Student" ? "B.Tech CSE" : "Software Engineer"} className={inputClass} /></div>
        <div><label className="block text-sm text-zinc-400 mb-2">Company / College</label><input name="company" value={draft.company} onChange={handleDraftChange} placeholder={draft.occupation === "Student" ? "College name" : "Company name"} className={inputClass} /></div>
      </div>

      <button type="submit" className="w-full bg-green-500 hover:bg-green-400 text-black p-3 rounded-lg font-semibold">{signedIn ? "Save Changes" : "Sign In & Save Profile"}</button>
      {!signedIn && <p className="text-xs text-zinc-500">Profile data is stored locally in this browser. No password is stored.</p>}
    </form>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02100d]/80 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#061a16] border border-[#25483f] rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#25483f] px-6 py-5">
          <div><h2 className="text-2xl font-bold">{view === "signin" ? "Set Up Profile" : "Profile"}</h2><p className="text-sm text-zinc-500 mt-1">Manage your income, occupation and monthly saving goal</p></div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-2xl" aria-label="Close profile">×</button>
        </div>
        <div className="p-6">
          {message && <div className="mb-5 rounded-lg border border-[#31584e] bg-[#0c2420] px-4 py-3 text-sm text-zinc-300">{message}</div>}
          {!signedIn ? form : (
            <>
              <div className="flex flex-wrap gap-2 mb-6">
                <button onClick={() => setView("profile")} className={`px-4 py-2 rounded-lg ${view === "profile" ? "bg-green-500 text-black" : "bg-[#0c2420]"}`}>Overview</button>
                <button onClick={() => { setDraft(profile); setView("edit"); }} className={`px-4 py-2 rounded-lg ${view === "edit" ? "bg-green-500 text-black" : "bg-[#0c2420]"}`}>Edit Profile</button>
                <button onClick={handleSignOut} className="ml-auto px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700">Sign Out</button>
              </div>
              {view === "edit" ? form : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-[#0c2420] border border-[#25483f] rounded-xl p-5"><p className="text-zinc-500 text-sm">Name</p><p className="text-lg font-semibold mt-1">{profile.name || "Not set"}</p></div>
                    <div className="bg-[#0c2420] border border-[#25483f] rounded-xl p-5"><p className="text-zinc-500 text-sm">Email</p><p className="text-lg font-semibold mt-1 break-all">{profile.email || "Not set"}</p></div>
                    <div className="bg-[#0c2420] border border-[#25483f] rounded-xl p-5"><p className="text-zinc-500 text-sm">Occupation</p><p className="text-lg font-semibold mt-1">{occupation}</p><p className="text-sm text-zinc-500 mt-1">{profile.jobTitle || (isStudent ? "Course not set" : "Role not set")}</p></div>
                    <div className="bg-[#0c2420] border border-[#25483f] rounded-xl p-5"><p className="text-zinc-500 text-sm">{incomeLabel}</p><p className="text-2xl font-bold mt-1">₹{monthlyIncome.toLocaleString("en-IN")}</p></div>
                  </div>
                  {isStudent && <div className="mt-4 bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-5"><p className="text-sm text-green-300 font-semibold">🎓 Student income sources</p><div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">{[["Allowance",profile.monthlyAllowance],["Part-time",profile.partTimeIncome],["Scholarship",profile.scholarship],["Other",profile.otherIncome]].map(([label,value])=><div key={label}><p className="text-xs text-zinc-500">{label}</p><p className="font-semibold mt-1">₹{(Number(value)||0).toLocaleString("en-IN")}</p></div>)}</div></div>}
                  <div className="mt-4 bg-emerald-950/20 border border-emerald-900/60 rounded-xl p-5">
                    <p className="text-zinc-500 text-sm">Total Money You Have at Present</p>
                    <p className="text-2xl font-bold mt-1 text-emerald-400">₹{(Number(profile.currentMoney) || 0).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-[#0c2420] border border-[#25483f] rounded-xl p-5"><p className="text-zinc-500 text-sm">Saving Goal</p><p className="text-xl font-bold mt-1 text-green-400">₹{savingGoal.toLocaleString("en-IN")}</p></div>
                    <div className="bg-[#0c2420] border border-[#25483f] rounded-xl p-5"><p className="text-zinc-500 text-sm">Planned Spending</p><p className="text-xl font-bold mt-1">₹{plannedSpending.toLocaleString("en-IN")}</p></div>
                    <div className="bg-[#0c2420] border border-[#25483f] rounded-xl p-5"><p className="text-zinc-500 text-sm">Current Expenses</p><p className="text-xl font-bold mt-1 text-red-400">₹{Number(totalExpense).toLocaleString("en-IN")}</p></div>
                  </div>
                  <div className="mt-6 bg-[#0c2420] border border-[#25483f] rounded-xl p-5"><div className="flex justify-between gap-4 mb-3"><span className="font-semibold">Saving Goal Progress</span><span className="text-zinc-400">{savingRate.toFixed(0)}%</span></div><div className="h-3 bg-[#17352f] rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: `${savingRate}%` }} /></div><p className="text-sm text-zinc-400 mt-4">{budgetStatus}</p></div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
