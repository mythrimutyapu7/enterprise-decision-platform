import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiSave, FiFileText } from "react-icons/fi";

import Card from "../common/Card";
import { saveAnalystNotes } from "../../services/incidentService";

interface Props {
  incidentId: string;
  initialNotes: string;
  onSaved?: (notes: string) => void;
}

export default function AnalystNotesCard({
  incidentId,
  initialNotes,
  onSaved,
}: Props) {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage("");

      const response = await saveAnalystNotes(incidentId, notes);

      if (!response?.success) {
        throw new Error(response?.error || "Unable to save notes.");
      }

      setMessage("Saved to MongoDB.");
      onSaved?.(notes);
    } catch {
      setMessage("Unable to save notes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card title="Analyst Notes">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <FiFileText className="text-cyan-400" />
            <p className="text-sm">
              Document observations, validation steps, and follow-up actions.
            </p>
          </div>

          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={6}
            placeholder="Observed abnormal VPN activity. Recommend immediate credential reset."
            className="w-full rounded-2xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-sm leading-7 text-white outline-none transition focus:border-cyan-400"
          />

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-slate-400">
              {message || "Saved notes are stored in MongoDB with the incident."}
            </p>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FiSave />
              {isSaving ? "Saving..." : "Save Notes"}
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}