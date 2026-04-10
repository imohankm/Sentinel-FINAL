import React from 'react';
import UserMenu from "./UserMenu";

export default function TopHeader({ user, activity, onOpenProfile, onLogout }) {
  return (
    <header
      style={{
        height: "84px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        borderBottom: "1px solid rgba(34,211,238,0.10)",
        background: "linear-gradient(180deg, rgba(5,8,22,0.96), rgba(5,8,22,0.86))",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div
          style={{
            color: "#E5F0FF",
            fontSize: "28px",
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.02em"
          }}
        >
          SentinelAI
        </div>
        <div
          style={{
            color: "#94A3B8",
            fontSize: "13px",
            fontWeight: 500,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            opacity: 0.8
          }}
        >
          Enterprise Cyber Defense
        </div>
      </div>

      <UserMenu 
        user={user}
        activity={activity}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
      />
    </header>
  );
}
