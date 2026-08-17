function getInitials(name = "User") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join("");
}

function Navbar({ onProfile, profileName = "User", notificationsOn = false, onEnableNotifications }) {
  return (
    <header className="bg-[#0c2420] border-b border-[#25483f] px-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          <span className="flex items-center gap-1.5"><img src="/pocketiq-money.png" alt="" aria-hidden="true" className="w-7 h-7 object-contain" /><span>PocketIQ</span></span>
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={onEnableNotifications}
            title={notificationsOn ? "Notifications enabled" : "Enable finance reminders"}
            aria-label={notificationsOn ? "Notifications enabled" : "Enable finance reminders"}
            className={`relative w-10 h-10 rounded-full flex items-center justify-center transition ${
              notificationsOn
                ? "bg-emerald-500 text-[#061a16]"
                : "bg-[#17352f] text-zinc-300 hover:bg-[#23483e]"
            }`}
          >
            <span className="text-lg">{notificationsOn ? "🔔" : "🔕"}</span>
            {notificationsOn && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white border border-emerald-500" />
            )}
          </button>

          <button
            onClick={onProfile}
            title="Open profile"
            aria-label="Open profile"
            className="flex items-center gap-3 rounded-full hover:bg-[#17352f] p-1 pr-3 transition"
          >
            <span className="w-10 h-10 rounded-full bg-emerald-500 text-[#061a16] flex items-center justify-center font-bold text-sm shadow">
              {getInitials(profileName)}
            </span>
            <span className="hidden sm:block text-sm font-semibold text-zinc-200">
              {profileName}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
