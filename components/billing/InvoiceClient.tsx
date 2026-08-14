"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Package,
  CheckCircle,
  MessageCircle,
  QrCode,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { markInvoicePaid } from "@/lib/actions/invoices";
import type { StudentInvoiceData } from "@/lib/actions/invoices";

interface Props {
  data: StudentInvoiceData;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
}

// Static PayLah QR placeholder
const PAYLAH_QR_URL =
  "https://placehold.co/200x200/2563EB/FFFFFF?text=PayLah+QR";

export default function InvoiceClient({ data }: Props) {
  const router = useRouter();
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [whatsAppSent, setWhatsAppSent] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [isPaid, setIsPaid] = useState(data.invoice?.status === "paid");
  const [showQr, setShowQr] = useState(false);

  const waMessage = `Hi, here is the invoice for ${data.month}:\n\n📚 ${data.sessions.length} sessions — S$${data.sessionTotal.toFixed(2)}\n🛒 Materials — S$${data.materialsTotal.toFixed(2)}\n💰 *Total: S$${data.grandTotal.toFixed(2)}*\n\nPlease pay via PayLah. Thank you! 🙏`;

  async function handleMarkPaid() {
    setMarkingPaid(true);
    await markInvoicePaid(data.student.id);
    setIsPaid(true);
    setMarkingPaid(false);
  }

  return (
    <div className="min-h-screen bg-page pb-28">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-page transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} className="text-deep-navy" />
        </button>
        <div className="flex-1">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            Invoice
          </p>
          <h1 className="text-sm font-medium text-deep-navy leading-tight">
            {data.student.name}
          </h1>
        </div>
        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
            isPaid ? "bg-success-bg text-success-text" : "bg-warning-bg text-warning-text"
          }`}
        >
          {isPaid ? "Paid" : "Pending"}
        </span>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {/* Student card */}
        <div className="bg-action-blue rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold text-sm">
              {getInitials(data.student.name)}
            </div>
            <div>
              <p className="font-medium text-base">{data.student.name}</p>
              <p className="text-white/60 text-xs">
                {data.student.subject} · {data.student.level}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60 text-xs">{data.month}</span>
            <span className="font-bold text-2xl">
              S${data.grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Session details */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <Clock size={14} className="text-deep-navy" />
            <p className="text-xs font-medium text-deep-navy uppercase tracking-widest">
              Sessions
            </p>
            <span className="ml-auto text-xs font-bold text-action-blue">
              S${data.sessionTotal.toFixed(2)}
            </span>
          </div>

          {data.sessions.length === 0 ? (
            <p className="text-xs text-muted-foreground px-4 pb-4">
              No completed sessions this month.
            </p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide bg-page">
                  <th className="text-left px-4 py-2">Date</th>
                  <th className="text-center px-2 py-2">Duration</th>
                  <th className="text-center px-2 py-2">Rate</th>
                  <th className="text-right px-4 py-2">Fee</th>
                </tr>
              </thead>
              <tbody>
                {data.sessions.map((item) => (
                  <tr
                    key={item.session.id}
                    className="border-t border-border"
                  >
                    <td className="px-4 py-2.5 text-deep-navy font-medium">
                      {formatDate(item.session.scheduledAt)}
                    </td>
                    <td className="px-2 py-2.5 text-center text-muted-foreground">
                      {formatDuration(item.session.durationMin)}
                    </td>
                    <td className="px-2 py-2.5 text-center text-muted-foreground">
                      S${data.student.hourlyRate}/hr
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-deep-navy">
                      S${item.fee.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Materials */}
        {data.materials.length > 0 && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 pt-4 pb-2">
              <Package size={14} className="text-deep-navy" />
              <p className="text-xs font-medium text-deep-navy uppercase tracking-widest">
                Materials
              </p>
              <span className="ml-auto text-xs font-bold text-action-blue">
                S${data.materialsTotal.toFixed(2)}
              </span>
            </div>
            <div className="divide-y divide-border">
              {data.materials.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <div>
                    <p className="text-xs font-medium text-deep-navy">
                      {m.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDate(m.createdAt)}
                    </p>
                  </div>
                  <p className="text-xs font-bold text-deep-navy">
                    S${m.cost.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grand total */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">
              Sessions subtotal
            </span>
            <span className="text-xs font-semibold text-deep-navy">
              S${data.sessionTotal.toFixed(2)}
            </span>
          </div>
          {data.materialsTotal > 0 && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                Materials subtotal
              </span>
              <span className="text-xs font-semibold text-deep-navy">
                S${data.materialsTotal.toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t border-border pt-2 mt-2 flex items-center justify-between">
            <span className="text-sm font-medium text-deep-navy">Total Due</span>
            <span className="text-xl font-bold text-deep-navy">
              S${data.grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* PayLah QR */}
        <div className="bg-white rounded-2xl border border-border p-4">
          <button
            onClick={() => setShowQr((v) => !v)}
            className="w-full flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <QrCode size={14} className="text-deep-navy" />
              <span className="text-xs font-medium text-deep-navy uppercase tracking-widest">
                PayLah QR Code
              </span>
            </div>
            {showQr ? (
              <ChevronUp size={14} className="text-muted-foreground" />
            ) : (
              <ChevronDown size={14} className="text-muted-foreground" />
            )}
          </button>

          {showQr && (
            <div className="mt-4 flex flex-col items-center gap-2 animate-fade-in">
              <img
                src={PAYLAH_QR_URL}
                alt="PayLah QR Code"
                className="w-48 h-48 rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                Scan with DBS PayLah to pay S${data.grandTotal.toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          {/* WhatsApp button */}
          <button
            onClick={() => setShowWhatsApp(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.97] cursor-pointer"
            style={{ backgroundColor: "#25D366" }}
          >
            <MessageCircle size={16} />
            Send via WhatsApp
          </button>

          {/* Mark paid */}
          {!isPaid && (
            <button
              onClick={handleMarkPaid}
              disabled={markingPaid}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-success-text font-bold text-sm hover:bg-success-bg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {markingPaid ? (
                <span className="w-4 h-4 border-2 border-action-blue border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle size={16} />
              )}
              Mark as Paid
            </button>
          )}

          {isPaid && (
            <div className="flex items-center justify-center gap-2 py-3 text-success-text text-sm font-semibold">
              <CheckCircle size={16} />
              Payment received
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Preview Modal */}
      {showWhatsApp && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => {
            if (!whatsAppSent) setShowWhatsApp(false);
          }}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl p-5 pb-10 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {!whatsAppSent ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#25D366" }}
                  >
                    <MessageCircle size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-deep-navy">
                      WhatsApp Preview
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      To: Parent of {data.student.name}
                    </p>
                  </div>
                </div>

                {/* Bubble */}
                <div
                  className="rounded-2xl rounded-bl-sm p-4 mb-5 text-sm text-white whitespace-pre-line"
                  style={{ backgroundColor: "#25D366" }}
                >
                  {waMessage}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowWhatsApp(false)}
                    className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-page transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setWhatsAppSent(true)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
                    style={{ backgroundColor: "#25D366" }}
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#25D366" }}
                >
                  <CheckCircle size={28} className="text-white" />
                </div>
                <p className="text-deep-navy font-medium text-base">
                  Message Sent!
                </p>
                <p className="text-muted-foreground text-xs text-center">
                  Invoice sent to parent of {data.student.name} via WhatsApp
                </p>
                <button
                  onClick={() => {
                    setShowWhatsApp(false);
                    setWhatsAppSent(false);
                  }}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-page text-deep-navy text-xs font-bold hover:bg-border transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
