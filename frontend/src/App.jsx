import { useEffect, useState } from "react";
import axios from "axios";

const STATUSES = ["WAITING", "IN_PROGRESS", "DONE"];

const statusConfig = {
  WAITING: { color: "#F59E0B", bg: "#FEF3C7", label: "Waiting" },
  IN_PROGRESS: { color: "#3B82F6", bg: "#DBEAFE", label: "In Chair" },
  DONE: { color: "#10B981", bg: "#D1FAE5", label: "Done" },
};

function Avatar({ name }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const colors = ["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#98D8C8","#F7DC6F","#BB8FCE","#85C1E9"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: 44, height: 44, borderRadius: "50%",
      background: bg, display: "flex", alignItems: "center",
      justifyContent: "center", fontWeight: 700, fontSize: 16,
      color: "#fff", flexShrink: 0,
      boxShadow: `0 0 0 3px ${bg}44`
    }}>{initials}</div>
  );
}

function TokenBadge({ number }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#fff", borderRadius: 10, padding: "2px 10px",
      fontSize: 12, fontWeight: 700, letterSpacing: 1,
    }}>#{String(number).padStart(3, "0")}</div>
  );
}

function StatusPill({ status }) {
  const cfg = statusConfig[status] || statusConfig.WAITING;
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      borderRadius: 20, padding: "3px 12px",
      fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
      border: `1px solid ${cfg.color}44`,
    }}>{cfg.label}</span>
  );
}

function QueueCard({ item, index, onStatusChange, onRemove }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#FAFAFE" : "#fff",
        border: "1.5px solid",
        borderColor: hovered ? "#667eea55" : "#e8e8f0",
        borderRadius: 16,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered ? "0 8px 24px #667eea18" : "0 1px 4px #0001",
        animation: `slideIn 0.4s ${index * 0.07}s both cubic-bezier(.4,0,.2,1)`,
      }}
    >
      <Avatar name={item.customer_name} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e", letterSpacing: -0.3 }}>
            {item.customer_name}
          </span>
          {/* <TokenBadge number={item.token_number} /> */}
        </div>
        <StatusPill status={item.status} />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {STATUSES.filter((s) => s !== item.status).map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(item.id, s)}
            style={{
              background: statusConfig[s].bg,
              color: statusConfig[s].color,
              border: "none",
              borderRadius: 8,
              padding: "5px 10px",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.opacity = 0.7)}
            onMouseLeave={(e) => (e.target.style.opacity = 1)}
          >
            → {statusConfig[s].label}
          </button>
        ))}
        <button
          onClick={() => onRemove(item.id)}
          style={{
            background: "#FEE2E2",
            color: "#EF4444",
            border: "none",
            borderRadius: 8,
            padding: "5px 10px",
            fontSize: 13,
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.opacity = 0.7)}
          onMouseLeave={(e) => (e.target.style.opacity = 1)}
          title="Remove"
        >✕</button>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{
      background: "#fff",
      border: "1.5px solid #e8e8f0",
      borderRadius: 14,
      padding: "14px 18px",
      flex: 1,
      minWidth: 90,
    }}>
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: -1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#888", fontWeight: 500, marginTop: 2 }}>{label}</div>
    </div>
  );
}

export default function App() {
  const [queue, setQueue] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [flash, setFlash] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/queue/");
      setQueue(res.data);
    } catch {
      // fallback demo data
      setQueue([
        { id: 1, customer_name: "Aryan Shah", token_number: 1, status: "IN_PROGRESS" },
        { id: 2, customer_name: "Priya Nair", token_number: 2, status: "WAITING" },
        { id: 3, customer_name: "Rahul Mehta", token_number: 3, status: "WAITING" },
        { id: 4, customer_name: "Divya Patel", token_number: 4, status: "DONE" },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchQueue(); }, []);

  const addCustomer = async () => {
    if (!name.trim()) return;
  
    setJoining(true);
  
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/add/",
        {
          customer_name: name.trim(),
          status: "WAITING",
        }
      );
  
      setFlash(true);
  
      setTimeout(() => setFlash(false), 800);
  
      fetchQueue();
  
    } catch (error) {
  
      console.log(error);
  
      alert("Failed to add customer");
  
    }
  
    setName("");
    setJoining(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/update/${id}/`, { status });
    } catch {}
    setQueue((q) => q.map((item) => item.id === id ? { ...item, status } : item));
  };

  const removeCustomer = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/delete/${id}/`);
    } catch {}
    setQueue((q) => q.filter((item) => item.id !== id));
  };

  const [confirmReset, setConfirmReset] = useState(false);

  const resetQueue = async () => {

    if (!confirmReset) {
  
      setConfirmReset(true);
  
      setTimeout(() => setConfirmReset(false), 3000);
  
      return;
    }
  
    try {
  
      await axios.delete(
        "http://127.0.0.1:8000/api/reset/"
      );
  
      await fetchQueue();
  
      setFilter("ALL");
  
    } catch (error) {
  
      console.log(error);
  
    }
  
    setConfirmReset(false);
  };

  const filtered = filter === "ALL" ? queue : queue.filter((i) => i.status === filter);
  const waiting = queue.filter((i) => i.status === "WAITING").length;
  const inChair = queue.filter((i) => i.status === "IN_PROGRESS").length;
  const done = queue.filter((i) => i.status === "DONE").length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8f7ff 0%, #fff4f4 50%, #f0f9ff 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: "32px 16px",
    }}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { transform: scale(0.95); opacity: 0; }
          60% { transform: scale(1.03); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 #667eea44; }
          50% { box-shadow: 0 0 0 8px #667eea00; }
        }
        .join-btn:hover { transform: scale(1.03); box-shadow: 0 8px 24px #667eea44 !important; }
        .join-btn:active { transform: scale(0.97); }
      `}</style>

      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Header */}
        <div style={{
          textAlign: "center", marginBottom: 32,
          animation: "popIn 0.5s cubic-bezier(.4,0,.2,1)",
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>✂️</div>
          <h1 style={{
            margin: 0, fontSize: 34, fontWeight: 900,
            background: "linear-gradient(135deg, #667eea, #f093fb)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            letterSpacing: -1.5,
          }}>Barber Queue</h1>
          <p style={{ color: "#999", margin: "6px 0 0", fontSize: 15 }}>
            Real-time appointment tracker
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: "flex", gap: 12, marginBottom: 24,
          animation: "slideIn 0.5s 0.1s both",
        }}>
          <StatCard label="Waiting" value={waiting} color="#F59E0B" icon="⏳" />
          <StatCard label="In Chair" value={inChair} color="#3B82F6" icon="💈" />
          <StatCard label="Served" value={done} color="#10B981" icon="✅" />
          <StatCard label="Total" value={queue.length} color="#8B5CF6" icon="👥" />
        </div>

        {/* Add Form */}
        <div style={{
          background: flash ? "linear-gradient(135deg, #f0fdf4, #dcfce7)" : "#fff",
          border: `2px solid ${flash ? "#10B98133" : "#e8e8f0"}`,
          borderRadius: 20,
          padding: "22px 22px",
          marginBottom: 24,
          transition: "all 0.4s ease",
          boxShadow: "0 2px 12px #0000060a",
          animation: "popIn 0.5s 0.15s both",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#888", marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>
            Add to Queue
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              placeholder="Customer name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomer()}
              style={{
                flex: 1,
                border: "1.5px solid #e8e8f0",
                borderRadius: 12,
                padding: "12px 16px",
                fontSize: 15,
                outline: "none",
                transition: "border-color 0.2s",
                fontFamily: "inherit",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#667eea")}
              onBlur={(e) => (e.target.style.borderColor = "#e8e8f0")}
            />
            <button
              className="join-btn"
              onClick={addCustomer}
              disabled={joining || !name.trim()}
              style={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "12px 22px",
                fontSize: 15,
                fontWeight: 700,
                cursor: name.trim() ? "pointer" : "not-allowed",
                opacity: name.trim() ? 1 : 0.5,
                transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
                whiteSpace: "nowrap",
                letterSpacing: -0.3,
              }}
            >
              {joining ? "Adding…" : "Join Queue"}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: "flex", gap: 6, marginBottom: 16,
          animation: "slideIn 0.5s 0.2s both",
        }}>
          {["ALL", ...STATUSES].map((s) => {
            const active = filter === s;
            const cfg = statusConfig[s];
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  background: active ? (s === "ALL" ? "linear-gradient(135deg,#667eea,#764ba2)" : cfg.bg) : "#fff",
                  color: active ? (s === "ALL" ? "#fff" : cfg.color) : "#aaa",
                  border: `1.5px solid ${active ? (s === "ALL" ? "#667eea" : cfg.color + "44") : "#e8e8f0"}`,
                  borderRadius: 20,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  letterSpacing: 0.3,
                }}
              >
                {s === "ALL" ? "All" : statusConfig[s].label}
                <span style={{
                  marginLeft: 6,
                  background: active ? "rgba(255,255,255,0.25)" : "#f0f0f8",
                  borderRadius: 10,
                  padding: "1px 7px",
                  fontSize: 11,
                  color: active ? (s === "ALL" ? "#fff" : cfg.color) : "#bbb",
                }}>
                  {s === "ALL" ? queue.length : queue.filter((i) => i.status === s).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Queue List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#ccc", fontSize: 15 }}>
              Loading queue…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "48px 0",
              color: "#ccc", fontSize: 15,
              animation: "popIn 0.4s both",
            }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>💈</div>
              {filter === "ALL" ? "No customers yet." : `No ${statusConfig[filter]?.label} customers.`}
            </div>
          ) : (
            filtered.map((item, i) => (
              <QueueCard
                key={item.id}
                item={item}
                index={i}
                onStatusChange={updateStatus}
                onRemove={removeCustomer}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: 28, animation: "slideIn 0.5s 0.4s both",
        }}>
          {queue.length > 0 ? (
            <span style={{ color: "#ccc", fontSize: 12 }}>
              {done}/{queue.length} customers served today
            </span>
          ) : <span />}
          <button
            onClick={resetQueue}
            style={{
              background: confirmReset ? "linear-gradient(135deg,#ef4444,#dc2626)" : "#fff",
              color: confirmReset ? "#fff" : "#EF4444",
              border: `1.5px solid ${confirmReset ? "#ef4444" : "#fecaca"}`,
              borderRadius: 12,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
              display: "flex", alignItems: "center", gap: 6,
              boxShadow: confirmReset ? "0 4px 16px #ef444433" : "none",
              transform: confirmReset ? "scale(1.04)" : "scale(1)",
            }}
            onMouseEnter={(e) => { if (!confirmReset) e.currentTarget.style.background = "#FEF2F2"; }}
            onMouseLeave={(e) => { if (!confirmReset) e.currentTarget.style.background = "#fff"; }}
          >
            <span style={{ fontSize: 15 }}>{confirmReset ? "⚠️" : "🔄"}</span>
            {confirmReset ? "Tap again to confirm" : "Reset Queue"}
          </button>
        </div>
      </div>
    </div>
  );
}