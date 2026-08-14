"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, DollarSign, ChevronRight, CheckCircle, Receipt } from "lucide-react";
import { markInvoicePaid } from "@/lib/actions/invoices";
import type { BillingOverview } from "@/lib/actions/invoices";

interface Props {
  overview: BillingOverview;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function BillingClient({ overview }: Props) {
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, "pending" | "paid">>({});

  async function handleMarkPaid(studentId: string) {
    setMarkingPaid(studentId);
    await markInvoicePaid(studentId);
    setLocalStatuses((prev) => ({ ...prev, [studentId]: "paid" }));
    setMarkingPaid(null);
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-medium text-deep-navy">Billing</h1>
        <p className="text-sm text-muted-foreground">{overview.month}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-action-blue rounded-2xl p-4 text-white">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={13} className="text-white/60" />
            <span className="text-xs font-semibold text-white/60">Total Income</span>
          </div>
          <p className="text-2xl font-bold">S${overview.grandTotal.toFixed(0)}</p>
          <p className="text-xs text-white/40 mt-0.5">this month</p>
        </div>
        <div className="bg-white border border-border rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <DollarSign size={13} className="text-warning-text" />
            <span className="text-xs font-semibold text-muted-foreground">Pending</span>
          </div>
          <p className="text-2xl font-bold text-warning-text">S${overview.pendingTotal.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">awaiting payment</p>
        </div>
      </div>

      {overview.students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-action-blue/10 flex items-center justify-center mb-4">
            <Receipt size={28} className="text-action-blue" />
          </div>
          <p className="text-deep-navy font-medium mb-1">No invoices yet</p>
          <p className="text-sm text-muted-foreground">Add a student to start tracking billing</p>
        </div>
      ) : (
        <>
          {/* Bar chart */}
          <div className="bg-white rounded-2xl border border-border p-4 mb-6">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-4">
              Breakdown by Student
            </p>
            <div className="flex flex-col gap-3">
              {overview.students.map((s) => (
                <div key={s.studentId} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                    style={{ backgroundColor: s.color }}
                  >
                    {getInitials(s.studentName)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-deep-navy">
                        {s.studentName.split(" ")[0]}
                      </span>
                      <span className="text-xs font-bold text-deep-navy">
                        S${s.total.toFixed(0)}
                      </span>
                    </div>
                    <div className="h-2 bg-page rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: overview.grandTotal > 0
                            ? `${(s.total / overview.grandTotal) * 100}%`
                            : "0%",
                          backgroundColor: s.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice cards */}
          <div className="flex flex-col gap-3 pb-28">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
              Invoices
            </p>
            {overview.students.map((s) => {
              const status = localStatuses[s.studentId] ?? s.status;
              const isPaid = status === "paid";

              return (
                <div
                  key={s.studentId}
                  className="bg-white rounded-2xl border border-border p-4"
                >
                  <Link
                    href={`/billing/${s.studentId}`}
                    className="flex items-center justify-between gap-3 hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: s.color }}
                      >
                        {getInitials(s.studentName)}
                      </div>
                      <div>
                        <p className="text-deep-navy font-semibold text-sm">{s.studentName}</p>
                        <p className="text-muted-foreground text-xs">
                          {s.sessionsCount} sessions · S${s.sessionFee.toFixed(0)} fees
                          {s.materialsTotal > 0 && ` + S${s.materialsTotal.toFixed(2)} materials`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-deep-navy font-bold text-sm">S${s.total.toFixed(0)}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPaid ? "bg-success-bg text-success-text" : "bg-warning-bg text-warning-text"
                        }`}>
                          {isPaid ? "Paid" : "Pending"}
                        </span>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground" />
                    </div>
                  </Link>

                  {/* Mark paid button */}
                  {!isPaid && (
                    <button
                      onClick={() => handleMarkPaid(s.studentId)}
                      disabled={markingPaid === s.studentId}
                      className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-action-blue/30 text-action-blue text-xs font-bold hover:bg-action-blue-50 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {markingPaid === s.studentId ? (
                        <span className="w-3.5 h-3.5 border-2 border-action-blue border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle size={13} />
                      )}
                      Mark as Paid
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
