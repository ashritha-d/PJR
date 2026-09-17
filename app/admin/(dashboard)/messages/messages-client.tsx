"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Eye, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDateTime } from "@/lib/utils";

type ContactMessage = {
  id: string;
  name: string;
  mobile: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-600",
  READ: "bg-forest-50 text-forest-500",
  REPLIED: "bg-forest-100 text-forest-700",
  CLOSED: "bg-forest-50 text-forest-400",
};

export function MessagesClient() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/messages");
    const data = await res.json();
    setMessages(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function openMessage(m: ContactMessage) {
    setSelected(m);
    if (m.status === "NEW") {
      await updateStatus(m.id, "READ");
    }
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error("Could not update message");
      return;
    }
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/admin/messages/${deleteTarget.id}`, { method: "DELETE" });
    setMessages((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    toast.success("Message deleted");
    setDeleteTarget(null);
  }

  const columns: Column<ContactMessage>[] = [
    {
      key: "from",
      header: "From",
      render: (m) => (
        <div>
          <p className="font-medium text-forest-800">{m.name}</p>
          <p className="text-xs text-forest-400">{m.email}</p>
        </div>
      ),
    },
    { key: "subject", header: "Subject", render: (m) => <span className="line-clamp-1">{m.subject}</span> },
    { key: "date", header: "Date", render: (m) => formatDateTime(m.createdAt) },
    {
      key: "status",
      header: "Status",
      render: (m) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[m.status]}`}>{m.status}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (m) => (
        <div className="flex gap-2">
          <button onClick={() => openMessage(m)} className="rounded-lg p-1.5 text-forest-500 hover:bg-forest-50 hover:text-forest-800">
            <Eye size={16} />
          </button>
          <button onClick={() => setDeleteTarget(m)} className="rounded-lg p-1.5 text-forest-500 hover:bg-red-50 hover:text-red-500">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="card p-10 text-center text-sm text-forest-400">Loading messages...</div>
      ) : (
        <DataTable columns={columns} rows={messages} emptyMessage="No messages yet." />
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Contact Message">
        {selected && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-forest-400">Name</p><p className="font-medium text-forest-800">{selected.name}</p></div>
              <div><p className="text-xs text-forest-400">Mobile</p><p className="font-medium text-forest-800">{selected.mobile}</p></div>
              <div><p className="text-xs text-forest-400">Email</p><p className="font-medium text-forest-800">{selected.email}</p></div>
              <div><p className="text-xs text-forest-400">Date</p><p className="font-medium text-forest-800">{formatDateTime(selected.createdAt)}</p></div>
            </div>
            <div>
              <p className="text-xs text-forest-400">Subject</p>
              <p className="font-medium text-forest-800">{selected.subject}</p>
            </div>
            <div>
              <p className="text-xs text-forest-400">Message</p>
              <p className="text-sm text-forest-600">{selected.message}</p>
            </div>
            <div className="flex gap-2 pt-2">
              {["READ", "REPLIED", "CLOSED"].map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(selected.id, s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${selected.status === s ? "bg-forest-700 text-cream-100" : "bg-forest-50 text-forest-600 hover:bg-forest-100"}`}
                >
                  Mark as {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Delete this message?" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
