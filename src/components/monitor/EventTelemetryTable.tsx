"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Laptop,
  Globe2,
  Clock,
  ChevronRight,
  Shield,
  Layers,
} from "lucide-react";
import { AuthenticationEvent, AuthenticationEventType } from "@/lib/security/monitor/types";
import { EventInspectorModal } from "./EventInspectorModal";

interface EventTelemetryTableProps {
  events: AuthenticationEvent[];
  maxRows?: number;
}

export function EventTelemetryTable({ events, maxRows }: EventTelemetryTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [inspectingEvent, setInspectingEvent] = useState<AuthenticationEvent | null>(null);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Type filter
      if (selectedType !== "ALL" && ev.eventType !== selectedType) {
        return false;
      }
      // Status filter
      if (selectedStatus === "SUCCESS" && !ev.success) return false;
      if (selectedStatus === "FAILURE" && ev.success) return false;

      // Query filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchUser = ev.userEmail.toLowerCase().includes(q);
        const matchIp = ev.ipAddress.toLowerCase().includes(q);
        const matchCity = ev.location.city.toLowerCase().includes(q);
        const matchCountry = ev.location.country.toLowerCase().includes(q);
        const matchDevice = ev.deviceName.toLowerCase().includes(q);
        return matchUser || matchIp || matchCity || matchCountry || matchDevice;
      }

      return true;
    });
  }, [events, selectedType, selectedStatus, searchQuery]);

  const displayedEvents = maxRows ? filteredEvents.slice(0, maxRows) : filteredEvents;

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search telemetry by email, IP, location, or device..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.08] text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="ALL">All Event Types</option>
            <option value="LOGIN">LOGIN</option>
            <option value="PASSWORD_FAILURE">PASSWORD_FAILURE</option>
            <option value="SESSION_CREATED">SESSION_CREATED</option>
            <option value="SESSION_REVOKED">SESSION_REVOKED</option>
            <option value="SUSPICIOUS_SESSION">SUSPICIOUS_SESSION</option>
            <option value="PRIVILEGED_ACTION">PRIVILEGED_ACTION</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900/80 border border-white/[0.08] text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success Only</option>
            <option value="FAILURE">Failures Only</option>
          </select>
        </div>
      </div>

      {/* Events Table Container */}
      <div className="overflow-x-auto rounded-2xl glass-panel border border-white/[0.08]">
        {displayedEvents.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Layers className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">
              No matching authentication events
            </p>
            <p className="text-xs text-slate-500">
              {events.length === 0
                ? "No telemetry recorded yet. Ingest an event or run a simulation scenario."
                : "No events match the selected search or filter criteria."}
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-slate-900/60 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Account Target</th>
                <th className="py-3 px-4">Origin / Location</th>
                <th className="py-3 px-4">Device / Client</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {displayedEvents.map((ev) => (
                <tr
                  key={ev.id}
                  onClick={() => setInspectingEvent(ev)}
                  className="hover:bg-cyan-500/[0.04] cursor-pointer transition-colors group"
                >
                  {/* Event Type & Demo Tag */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {ev.eventType}
                      </span>
                      {ev.isDemo && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/15 border border-amber-500/30 text-amber-300">
                          DEMO
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Account Email */}
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-300">
                    {ev.userEmail}
                  </td>

                  {/* IP & Location */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex flex-col font-mono text-[11px]">
                      <span className="text-slate-200">{ev.ipAddress}</span>
                      <span className="text-slate-500 text-[10px]">
                        {ev.location.city}, {ev.location.country}
                      </span>
                    </div>
                  </td>

                  {/* Device & Browser */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex flex-col text-[11px]">
                      <span className="text-slate-300 truncate max-w-[160px]">
                        {ev.deviceName}
                      </span>
                      <span className="text-slate-500 text-[10px] font-mono">
                        {ev.browser}
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        ev.success
                          ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                          : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
                      }`}
                    >
                      {ev.success ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> SUCCESS
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3" /> FAILED
                        </>
                      )}
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                    {new Date(ev.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>

                  {/* Chevron Action */}
                  <td className="py-3 px-3 text-right">
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all inline-block" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Inspector Modal */}
      <EventInspectorModal
        event={inspectingEvent}
        onClose={() => setInspectingEvent(null)}
      />
    </div>
  );
}
