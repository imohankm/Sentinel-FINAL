import { useEffect } from "react";

export default function ProfileDrawer({ open, onClose, user, activity }) {
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }

    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [open, onClose]);

  if (!open) return null;

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
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(2, 6, 23, 0.60)",
          backdropFilter: "blur(4px)",
          zIndex: 999,
        }}
      />

      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "460px",
          maxWidth: "92vw",
          height: "100vh",
          background: "#0B1220",
          borderLeft: "1px solid rgba(34,211,238,0.14)",
          boxShadow: "-10px 0 36px rgba(0,0,0,0.45)",
          zIndex: 1000,
          padding: "24px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "14px",
            marginBottom: "22px",
          }}
        >
          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <div
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #22D3EE, #7C3AED)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: "20px",
              }}
            >
              {safeUser.name?.[0] || 'S'}
            </div>

            <div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#E5F0FF" }}>
                {safeUser.name}
              </div>
              <div style={{ fontSize: "13px", color: "#94A3B8", marginTop: "4px" }}>
                {safeUser.email}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "#0E1628",
              border: "1px solid rgba(148,163,184,0.18)",
              color: "#E5F0FF",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ✕
          </button>
        </div>

        <Section title="Account Information">
          <InfoRow label="Full Name" value={safeUser.name} />
          <InfoRow label="Corporate Email" value={safeUser.email} />
          <InfoRow label="Role" value={safeUser.role} />
          <InfoRow label="Organization" value={safeUser.organization} />
        </Section>

        <Section title="Session Details">
          <InfoRow label="Current Session Started" value={safeUser.currentSessionStartedAt} />
          <InfoRow label="Last Login" value={safeUser.lastLoginAt} />
          <InfoRow label="Session Type" value={safeUser.sessionType} />
          <InfoRow label="Authentication State" value={safeUser.authState} />
          <InfoRow label="Encryption State" value={safeUser.encryptionState} />
        </Section>

        <Section title="Activity Summary">
          <InfoRow label="Audits Initiated" value={String(safeUser.auditsInitiated)} />
          <InfoRow label="Reports Viewed" value={String(safeUser.reportsViewed)} />
          <InfoRow label="Last Active" value={safeUser.lastActiveAt} />
        </Section>

        <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              height: "46px",
              borderRadius: "14px",
              border: "1px solid rgba(34,211,238,0.16)",
              background: "#101A2E",
              color: "#E5F0FF",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Close
          </button>
        </div>
      </aside>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div
      style={{
        background: "#0E1628",
        border: "1px solid rgba(34,211,238,0.12)",
        borderRadius: "20px",
        padding: "18px",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          color: "#94A3B8",
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          marginBottom: "14px",
          fontWeight: 700,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        paddingBottom: "12px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          color: "#94A3B8",
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: "#E5F0FF",
          fontSize: "15px",
          fontWeight: 500,
          lineHeight: 1.4,
        }}
      >
        {value}
      </div>
    </div>
  );
}
