import { useEffect, useRef, useState } from "react";
import ProfileDrawer from "./ProfileDrawer";

export default function UserMenu({ user, activity, onOpenProfile, onLogout }) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const safeUser = {
    name: user?.name || "Security Director",
    email: user?.email || "admin@sentinel.ai",
    role: user?.role || "Admin",
    organization: user?.org_name || "CorpNet Enterprise",
    currentSessionStartedAt: user?.current_session_started_at ? new Date(user.current_session_started_at).toLocaleString() : "Just now",
    lastLoginAt: user?.last_login_at ? new Date(user.last_login_at).toLocaleString() : "Today, 5:20 PM",
    sessionType: "Enterprise Desktop Session",
    authState: "Authenticated",
    encryptionState: "AES-256-GCM",
    auditsInitiated: activity?.audits_initiated || 18,
    reportsViewed: activity?.reports_viewed || 42,
    lastActiveAt: activity?.last_active_at || "Just now",
  };

  return (
    <>
      <div
        ref={menuRef}
        style={{
          position: "relative",
        }}
      >
        <button
          onClick={() => setOpen((prev) => !prev)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: "214px",
            background: "#0E1628",
            border: "1px solid rgba(34,211,238,0.20)",
            color: "#E5F0FF",
            borderRadius: "18px",
            padding: "10px 14px 10px 10px",
            cursor: "pointer",
            boxShadow: "0 0 20px rgba(34,211,238,0.08)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #22D3EE, #7C3AED)",
              color: "white",
              fontWeight: 800,
              fontSize: "17px",
              flexShrink: 0,
            }}
          >
            {safeUser.name?.[0] || 'S'}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              lineHeight: 1.1,
              flex: 1,
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#E5F0FF",
              }}
            >
              {safeUser.name}
            </span>
            <span
              style={{
                fontSize: "12px",
                color: "#94A3B8",
                marginTop: "4px",
              }}
            >
              {safeUser.role}
            </span>
          </div>

          <span style={{ color: "#94A3B8", fontSize: "13px" }}>
            {open ? "▲" : "▼"}
          </span>
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              width: "260px",
              background: "#0B1220",
              border: "1px solid rgba(34,211,238,0.16)",
              borderRadius: "18px",
              padding: "14px",
              color: "#E5F0FF",
              boxShadow: "0 16px 44px rgba(0,0,0,0.45)",
              zIndex: 200,
            }}
          >
            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontWeight: 700, fontSize: "14px" }}>{safeUser.name}</div>
              <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "4px" }}>
                {safeUser.email}
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.08)",
                paddingTop: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <button
                onClick={() => {
                  onOpenProfile();
                  setProfileOpen(true);
                  setOpen(false);
                }}
                style={menuButtonStyle("#101A2E", "#E5F0FF", "rgba(34,211,238,0.14)")}
              >
                View Profile
              </button>

              <button
                onClick={onLogout}
                style={menuButtonStyle(
                  "transparent",
                  "#FF4D6D",
                  "rgba(255,77,109,0.28)"
                )}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      <ProfileDrawer
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        activity={activity}
      />
    </>
  );
}

function menuButtonStyle(bg, color, border) {
  return {
    width: "100%",
    background: bg,
    color,
    border: `1px solid ${border}`,
    borderRadius: "12px",
    padding: "10px 12px",
    textAlign: "left",
    cursor: "pointer",
    fontWeight: 600,
  };
}
