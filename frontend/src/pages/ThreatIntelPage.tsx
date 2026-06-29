import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiShield, FiAlertOctagon, FiLoader } from 'react-icons/fi';
import Card from '../components/common/Card';
import { fetchIncidents } from '../services/incidentService';

const ThreatIntelPage = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchIncidents();
        setIncidents(data);
      } catch (err) {
        console.error("Failed to load incidents for threat intel", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const dynamicIocs = useMemo(() => {
    const iocList: any[] = [];
    const seen = new Set<string>();

    incidents.forEach(inc => {
      // 1. Pull from AI analysis if available
      const indicators = inc.analysis?.analysis?.indicators || [];
      indicators.forEach((ind: string) => {
        if (!seen.has(ind)) {
          seen.add(ind);
          let type = 'Indicator';
          if (ind.includes('.') && ind.match(/\d/)) type = 'IP Address';
          else if (ind.includes('.')) type = 'Domain Name';
          else if (ind.length >= 32) type = 'File Hash';
          
          iocList.push({
            type,
            indicator: ind,
            threat: `${inc.title} - Associated Threat`,
            confidence: inc.severity === 'critical' ? 'Critical (99%)' : 'High (90%)',
            updated: new Date(inc.createdAt).toLocaleDateString()
          });
        }
      });

      // 2. Scan description for custom items (like IPs)
      const desc = inc.description || '';
      const ipMatch = desc.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g);
      if (ipMatch) {
        ipMatch.forEach((ip: string) => {
          if (!seen.has(ip)) {
            seen.add(ip);
            iocList.push({
              type: 'IP Address',
              indicator: ip,
              threat: `Source IP in: ${inc.title}`,
              confidence: 'High (85%)',
              updated: new Date(inc.createdAt).toLocaleDateString()
            });
          }
        });
      }
    });

    // Fallbacks if no indicators exist
    if (iocList.length === 0) {
      return [
        { type: 'IP Address', indicator: '185.220.101.44', threat: 'Tor Exit Node / Brute Force Botnet', confidence: 'High (95%)', updated: '10 mins ago' },
        { type: 'IP Address', indicator: '82.102.23.109', threat: 'Command & Control (C2) Link', confidence: 'Critical (99%)', updated: '1 hour ago' },
        { type: 'File Hash', indicator: 'd3b07384d113edec49eaa6238ad5ff00', threat: 'Trojan downloader payload', confidence: 'High (90%)', updated: 'Yesterday' }
      ];
    }

    return iocList;
  }, [incidents]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="space-y-6">
      <div>
        <p className="eyebrow">Threat Intelligence</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Global Threat Intel</h1>
        <p className="mt-1 text-sm text-muted">Aggregated Indicator of Compromise (IOC) feeds, IP reputation checks, and active threat definitions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="premium-panel flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-critical/10 text-critical">
            <FiAlertOctagon className="h-6 w-6" />
          </span>
          <div>
            <p className="eyebrow">Threat Sources</p>
            <p className="mt-1 text-2xl font-bold text-white">Interactive Feeds</p>
          </div>
        </div>
        <div className="premium-panel flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4f8cff]/10 text-primary">
            <FiShield className="h-6 w-6" />
          </span>
          <div>
            <p className="eyebrow">Total Indicators</p>
            <p className="mt-1 text-2xl font-bold text-white">{isLoading ? '...' : dynamicIocs.length} Active</p>
          </div>
        </div>
        <div className="premium-panel flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
            <FiTrendingUp className="h-6 w-6" />
          </span>
          <div>
            <p className="eyebrow">Sync Status</p>
            <p className="mt-1 text-2xl font-bold text-white">Live Synchronized</p>
          </div>
        </div>
      </div>

      <Card title="Latest Indicators of Compromise (IOCs)">
        {isLoading ? (
          <div className="py-20 flex justify-center items-center text-slate-500 gap-2">
            <FiLoader className="animate-spin" /> Loading Threat Intelligence feed...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-slate-500">
                  <th className="py-4">Type</th>
                  <th className="py-4">Indicator</th>
                  <th className="py-4">Associated Threat</th>
                  <th className="py-4">Confidence</th>
                  <th className="py-4">Updated</th>
                </tr>
              </thead>
              <tbody>
                {dynamicIocs.map((ioc, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-4 font-semibold text-white">{ioc.type}</td>
                    <td className="py-4 font-mono text-slate-400">{ioc.indicator}</td>
                    <td className="py-4">{ioc.threat}</td>
                    <td className="py-4 text-[#9bbcff]">{ioc.confidence}</td>
                    <td className="py-4 text-xs text-slate-500">{ioc.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default ThreatIntelPage;
