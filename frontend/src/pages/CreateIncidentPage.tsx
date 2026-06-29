import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createIncident } from '../services/incidentService';
import { IncidentSeverity, IncidentStatus } from '../types/incident';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import { 
  FiEdit3, 
  FiMail, 
  FiShield, 
  FiFileText, 
  FiMessageSquare, 
  FiFile, 
  FiActivity,
  FiArrowRight,
  FiUploadCloud,
  FiTrash2,
  FiCpu,
  FiCheckCircle,
  FiLayers,
  FiDatabase,
  FiUser,
  FiTerminal
} from 'react-icons/fi';

// Define the configurations for Ingestion Sources
interface SourceConfig {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
}

const SOURCES: SourceConfig[] = [
  {
    id: 'Manual Incident',
    name: 'Manual Incident',
    icon: FiEdit3,
    description: 'Direct log entry by a security analyst.',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'Email',
    name: 'Email Intake',
    icon: FiMail,
    description: 'Ingest suspicious phishing alerts or reports.',
    color: 'from-sky-500 to-blue-600'
  },
  {
    id: 'Security Alert',
    name: 'Security Alert',
    icon: FiShield,
    description: 'Sentinel, Defender, Splunk SIEM alerts.',
    color: 'from-red-500 to-orange-500'
  },
  {
    id: 'Log File',
    name: 'Log Ingestion',
    icon: FiFileText,
    description: 'Ingest system, firewall, or syslog entries.',
    color: 'from-amber-500 to-yellow-600'
  },
  {
    id: 'Meeting Transcript',
    name: 'Transcript Ingest',
    icon: FiMessageSquare,
    description: 'Import war room or team collaboration audio logs.',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'PDF Report',
    name: 'PDF Intel Report',
    icon: FiFile,
    description: 'Upload structured threat intelligence reports.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'Threat Intelligence Feed',
    name: 'Threat Intel Feed',
    icon: FiActivity,
    description: 'Ingest direct feeds containing CVEs and IOCs.',
    color: 'from-cyan-500 to-blue-500'
  }
];

// Rich mock details for quick evaluation
const MOCK_DATA = {
  'Manual Incident': {
    title: 'Unusual S3 Bucket Public ACL Access',
    description: 'AWS CloudTrail log detected bucket "enterprise-confidential-reports" changed access control list to public. IP Origin: 198.51.100.42.',
    severity: 'critical' as IncidentSeverity,
    status: 'open' as IncidentStatus
  },
  'Email': {
    subject: 'URGENT: Verify Your Credentials Immediately',
    sender: 'security-alert-microsoft@secure-login-portal.info',
    body: 'Dear Admin,\n\nWe detected a security concern on your Azure portal. Please login within 24 hours to secure your environment:\nhttp://secure-login-portal.info/login.php.\n\nThanks,\nMicrosoft Security Team',
    attachmentName: 'security_update_2026.exe'
  },
  'Security Alert': {
    alertName: 'Brute Force Attempts Detected on Web Gateway',
    alertSource: 'Microsoft Sentinel',
    alertPayload: JSON.stringify({
      timestamp: '2026-06-29T12:00:00Z',
      host: 'soc-prod-web-01',
      failed_attempts: 47,
      attacker_ip: '203.0.113.88',
      target_user: 'root',
      action: 'blocked'
    }, null, 2),
    severity: 'high' as IncidentSeverity
  },
  'Log File': {
    filename: 'syslog_auth_failure.log',
    filesize: 1420,
    fileSnippet: 'Jun 29 12:14:02 soc-prod-web-01 sshd[10943]: Failed password for invalid user admin from 203.0.113.88 port 48212 ssh2\nJun 29 12:14:05 soc-prod-web-01 sshd[10943]: Failed password for invalid user admin from 203.0.113.88 port 48218 ssh2\nJun 29 12:14:10 soc-prod-web-01 sshd[10943]: Connection closed by authenticating user root 203.0.113.88 port 48220'
  },
  'Meeting Transcript': {
    transcript: '[00:01:12] Sarah (SOC): We are seeing unusual DB query volume spike on production cluster-01.\n[00:01:25] Bob (Lead): Is it origin API Gateway traffic or internal network?\n[00:01:40] Sarah (SOC): Direct staging VPC traffic. Let\'s quarantine IP 10.12.94.31 immediately.',
    participants: 'Sarah Jenkins (SOC Analyst), Bob Carter (SOC Lead)'
  },
  'PDF Report': {
    filename: 'APT29_Cozy_Bear_Intel_Update.pdf',
    filesize: 42104,
    fileSnippet: 'APT29 CAMPAIGN BRIEF:\nState-sponsored campaign targeting diplomatic and government entities.\nKey Indicators of Compromise (IOCs):\n- C2 Domain: update.windows-service.org\n- Payload Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\n- Vulnerability Leveraged: CVE-2026-30219 (Remote Code Execution)'
  },
  'Threat Intelligence Feed': {
    iocText: 'update.windows-service.org',
    cve: 'CVE-2026-30219',
    threatReport: 'Host update.windows-service.org resolves to known malicious IP block associated with APT29 campaigns. CVE-2026-30219 exploits remote deserialization vulnerabilities.'
  }
};

const CreateIncidentPage = () => {
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || '{}');
    } catch {
      return {};
    }
  }, []);

  const navigate = useNavigate();
  const [activeSource, setActiveSource] = useState<string>('Manual Incident');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File drag-over states
  const [isDragOver, setIsDragOver] = useState(false);

  // Individual Form States
  const [manualForm, setManualForm] = useState({
    title: '',
    description: '',
    severity: 'low' as IncidentSeverity,
    status: 'open' as IncidentStatus
  });

  const [emailForm, setEmailForm] = useState({
    subject: '',
    sender: '',
    body: '',
    attachmentName: ''
  });

  const [alertForm, setAlertForm] = useState({
    alertName: '',
    alertSource: 'Microsoft Sentinel',
    alertPayload: '',
    severity: 'medium' as IncidentSeverity
  });

  const [logForm, setLogForm] = useState({
    filename: '',
    filesize: 0,
    fileSnippet: ''
  });

  const [transcriptForm, setTranscriptForm] = useState({
    transcript: '',
    participants: ''
  });

  const [pdfForm, setPdfForm] = useState({
    filename: '',
    filesize: 0,
    fileSnippet: ''
  });

  const [intelForm, setIntelForm] = useState({
    iocText: '',
    cve: '',
    threatReport: ''
  });

  // Load Mock Data helper
  const handleLoadMock = () => {
    const mock = MOCK_DATA[activeSource as keyof typeof MOCK_DATA];
    if (!mock) return;

    if (activeSource === 'Manual Incident') {
      setManualForm(mock as any);
    } else if (activeSource === 'Email') {
      setEmailForm(mock as any);
    } else if (activeSource === 'Security Alert') {
      setAlertForm(mock as any);
    } else if (activeSource === 'Log File') {
      setLogForm(mock as any);
    } else if (activeSource === 'Meeting Transcript') {
      setTranscriptForm(mock as any);
    } else if (activeSource === 'PDF Report') {
      setPdfForm(mock as any);
    } else if (activeSource === 'Threat Intelligence Feed') {
      setIntelForm(mock as any);
    }
  };

  // Clear Form Helper
  const handleClearForm = () => {
    if (activeSource === 'Manual Incident') {
      setManualForm({ title: '', description: '', severity: 'low', status: 'open' });
    } else if (activeSource === 'Email') {
      setEmailForm({ subject: '', sender: '', body: '', attachmentName: '' });
    } else if (activeSource === 'Security Alert') {
      setAlertForm({ alertName: '', alertSource: 'Microsoft Sentinel', alertPayload: '', severity: 'medium' });
    } else if (activeSource === 'Log File') {
      setLogForm({ filename: '', filesize: 0, fileSnippet: '' });
    } else if (activeSource === 'Meeting Transcript') {
      setTranscriptForm({ transcript: '', participants: '' });
    } else if (activeSource === 'PDF Report') {
      setPdfForm({ filename: '', filesize: 0, fileSnippet: '' });
    } else if (activeSource === 'Threat Intelligence Feed') {
      setIntelForm({ iocText: '', cve: '', threatReport: '' });
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragOver(true);
    } else if (e.type === 'dragleave') {
      setIsDragOver(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processUploadedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processUploadedFile(file);
    }
  };

  const processUploadedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string || '';
      if (activeSource === 'Log File') {
        setLogForm({
          filename: file.name,
          filesize: file.size,
          fileSnippet: text.slice(0, 1500)
        });
      } else if (activeSource === 'PDF Report') {
        setPdfForm({
          filename: file.name,
          filesize: file.size,
          fileSnippet: `Metadata Ingestion Complete:\nName: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nType: ${file.type || 'application/pdf'}\n\n[Parsed Headers]:\nReport Date: ${new Date().toLocaleDateString()}\nStatus: Verified Threat Document\nRaw Extraction:\n${text.slice(0, 1000) || '(Binary Stream Analyzed)'}`
        });
      } else if (activeSource === 'Email') {
        setEmailForm(prev => ({
          ...prev,
          attachmentName: file.name
        }));
      }
    };

    if (file.type.includes('text') || file.name.endsWith('.log') || file.name.endsWith('.json') || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  // Compile normalized payload
  const livePayload = useMemo(() => {
    switch (activeSource) {
      case 'Manual Incident':
        return {
          source_type: 'Manual Incident',
          raw_content: manualForm.description,
          metadata: {
            title: manualForm.title,
            description: manualForm.description,
            severity: manualForm.severity,
            status: manualForm.status
          }
        };
      case 'Email':
        return {
          source_type: 'Email',
          raw_content: emailForm.body,
          metadata: {
            subject: emailForm.subject,
            sender: emailForm.sender,
            body: emailForm.body,
            attachment: emailForm.attachmentName || undefined
          }
        };
      case 'Security Alert':
        return {
          source_type: 'Security Alert',
          raw_content: alertForm.alertPayload,
          metadata: {
            alert_name: alertForm.alertName,
            alert_source: alertForm.alertSource,
            alert_payload: alertForm.alertPayload,
            severity: alertForm.severity
          }
        };
      case 'Log File':
        return {
          source_type: 'Log File',
          raw_content: logForm.fileSnippet,
          metadata: {
            filename: logForm.filename,
            filesize: logForm.filesize
          }
        };
      case 'Meeting Transcript':
        return {
          source_type: 'Meeting Transcript',
          raw_content: transcriptForm.transcript,
          metadata: {
            transcript: transcriptForm.transcript,
            participants: transcriptForm.participants
          }
        };
      case 'PDF Report':
        return {
          source_type: 'PDF Report',
          raw_content: pdfForm.fileSnippet,
          metadata: {
            filename: pdfForm.filename,
            filesize: pdfForm.filesize
          }
        };
      case 'Threat Intelligence Feed':
        return {
          source_type: 'Threat Intelligence Feed',
          raw_content: intelForm.threatReport,
          metadata: {
            ioc_text: intelForm.iocText,
            cve: intelForm.cve,
            threat_report: intelForm.threatReport
          }
        };
      default:
        return {};
    }
  }, [activeSource, manualForm, emailForm, alertForm, logForm, transcriptForm, pdfForm, intelForm]);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate payload minimally
    const payload = livePayload as any;
    if (!payload.source_type || !payload.raw_content) {
      setError('Cannot submit empty content. Please fill out details or load mock data.');
      return;
    }

    setIsLoading(true);
    try {
      await createIncident(payload);
      navigate('/incidents');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Unable to ingest multi-source incident at this time.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get current source details for rendering the animated pipeline
  const activeSourceConfig = useMemo(() => {
    return SOURCES.find(s => s.id === activeSource) || SOURCES[0];
  }, [activeSource]);

  const ActiveIconComponent = activeSourceConfig.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.45 }} 
      className="space-y-6 max-w-7xl mx-auto pb-10"
    >
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="glass-pill text-blue-400 font-semibold">SOAR Telemetry Ingest</span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Unified Incident Ingestion</h1>
          <p className="mt-1 text-sm text-slate-400">
            Ingest structured and unstructured data feeds. The Normalization Engine formats telemetry into standardized schemas for the AI Planner Agent.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleLoadMock}
            className="glass-button text-xs py-2 px-4 flex items-center gap-2 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-300 cursor-pointer"
          >
            <FiTerminal className="w-3.5 h-3.5" />
            Inject Mock Data
          </button>
          <button
            type="button"
            onClick={handleClearForm}
            className="glass-button text-xs py-2 px-4 flex items-center gap-2 border-slate-700/50 hover:bg-white/5 cursor-pointer"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
            Reset Form
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Hand: Selection and Ingestion Fields */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Source Selector */}
          <div className="glass-card p-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 mb-4">
              1. Choose Ingestion Source
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {SOURCES.map(source => {
                const Icon = source.icon;
                const isSelected = activeSource === source.id;
                return (
                  <button
                    key={source.id}
                    type="button"
                    onClick={() => setActiveSource(source.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all duration-300 relative group cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_20px_rgba(79,140,255,0.15)] text-white' 
                        : 'bg-white/[0.02] border-slate-800 hover:border-slate-700 hover:bg-white/[0.04] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg mb-2 transition-colors duration-300 ${
                      isSelected ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-900/60 text-slate-500 group-hover:text-slate-300'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold tracking-wide leading-tight">{source.name}</span>
                    
                    {isSelected && (
                      <motion.div 
                        layoutId="activeGlow" 
                        className="absolute inset-0 border border-blue-400/30 rounded-xl pointer-events-none"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Form card */}
          <Card title={`${activeSource} Configuration`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSource}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  
                  {/* Form fields rendering dynamically */}
                  {activeSource === 'Manual Incident' && (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block text-left">
                          <span className="mb-2 block text-xs font-semibold text-slate-300">Incident Title</span>
                          <input
                            type="text"
                            value={manualForm.title}
                            onChange={e => setManualForm({...manualForm, title: e.target.value})}
                            className="glass-field text-left"
                            placeholder="e.g. Unauthorized S3 Bucket Access"
                            required
                          />
                        </label>
                        <label className="block text-left">
                          <span className="mb-2 block text-xs font-semibold text-slate-300">Reported By</span>
                          <input
                            type="text"
                            value={currentUser.name || 'Security Analyst'}
                            disabled
                            className="glass-field opacity-60 cursor-not-allowed text-left"
                          />
                        </label>
                      </div>

                      {/* Severity and Status removed from manual creation as they are decided after analysis */}

                      <label className="block text-left">
                        <span className="mb-2 block text-xs font-semibold text-slate-300">Incident Description</span>
                        <textarea
                          rows={6}
                          value={manualForm.description}
                          onChange={e => setManualForm({...manualForm, description: e.target.value})}
                          className="glass-field rounded-2xl min-h-[120px] text-left"
                          placeholder="Describe the incident, indicators, resources affected..."
                          required
                        />
                      </label>
                    </div>
                  )}

                  {activeSource === 'Email' && (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block text-left">
                          <span className="mb-2 block text-xs font-semibold text-slate-300">Sender Address</span>
                          <input
                            type="email"
                            value={emailForm.sender}
                            onChange={e => setEmailForm({...emailForm, sender: e.target.value})}
                            className="glass-field text-left"
                            placeholder="e.g. phish@target-domain.com"
                            required
                          />
                        </label>
                        <label className="block text-left">
                          <span className="mb-2 block text-xs font-semibold text-slate-300">Subject Line</span>
                          <input
                            type="text"
                            value={emailForm.subject}
                            onChange={e => setEmailForm({...emailForm, subject: e.target.value})}
                            className="glass-field text-left"
                            placeholder="e.g. Critical Update Required"
                            required
                          />
                        </label>
                      </div>

                      <label className="block text-left">
                        <span className="mb-2 block text-xs font-semibold text-slate-300">Email Body Content</span>
                        <textarea
                          rows={6}
                          value={emailForm.body}
                          onChange={e => setEmailForm({...emailForm, body: e.target.value})}
                          className="glass-field rounded-2xl min-h-[120px] text-left"
                          placeholder="Paste full raw email body text or headers here..."
                          required
                        />
                      </label>

                      {/* File attachment */}
                      <div className="text-left">
                        <span className="mb-2 block text-xs font-semibold text-slate-300">Email Attachment (Optional)</span>
                        <div className="flex items-center gap-3">
                          <label className="glass-button text-xs py-2.5 px-4 cursor-pointer hover:bg-white/10 flex items-center gap-2 border-slate-700/50">
                            <FiUploadCloud className="w-4 h-4 text-blue-400" />
                            Attach File
                            <input
                              type="file"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                          </label>
                          {emailForm.attachmentName ? (
                            <div className="flex items-center justify-between py-2 px-3 bg-white/5 border border-slate-800 rounded-lg text-xs w-full max-w-xs">
                              <span className="truncate text-slate-300 font-mono">{emailForm.attachmentName}</span>
                              <button
                                type="button"
                                onClick={() => setEmailForm(prev => ({ ...prev, attachmentName: '' }))}
                                className="text-red-400 hover:text-red-300 ml-2"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 font-mono">No file attached</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSource === 'Security Alert' && (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <label className="block md:col-span-2 text-left">
                          <span className="mb-2 block text-xs font-semibold text-slate-300">Alert Name</span>
                          <input
                            type="text"
                            value={alertForm.alertName}
                            onChange={e => setAlertForm({...alertForm, alertName: e.target.value})}
                            className="glass-field text-left"
                            placeholder="e.g. Multiple failed logins detected"
                            required
                          />
                        </label>
                        <label className="block text-left">
                          <span className="mb-2 block text-xs font-semibold text-slate-300">Alert Source</span>
                          <select
                            value={alertForm.alertSource}
                            onChange={e => setAlertForm({...alertForm, alertSource: e.target.value})}
                            className="glass-field py-[11px] text-left"
                          >
                            <option value="Microsoft Sentinel" className="bg-[#0b1120] text-white font-sans">Sentinel</option>
                            <option value="Splunk SIEM" className="bg-[#0b1120] text-white font-sans">Splunk</option>
                            <option value="Defender for Endpoint" className="bg-[#0b1120] text-white font-sans">Defender</option>
                            <option value="CrowdStrike Falcon" className="bg-[#0b1120] text-white font-sans">CrowdStrike</option>
                            <option value="Palo Alto Cortex" className="bg-[#0b1120] text-white font-sans">Cortex XDR</option>
                          </select>
                        </label>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block text-left">
                          <span className="mb-2 block text-xs font-semibold text-slate-300">Initial Alert Severity</span>
                          <select
                            value={alertForm.severity}
                            onChange={e => setAlertForm({...alertForm, severity: e.target.value as IncidentSeverity})}
                            className="glass-field py-[11px] text-left"
                          >
                            <option value="low" className="bg-[#0b1120] text-white font-sans">Low</option>
                            <option value="medium" className="bg-[#0b1120] text-white font-sans">Medium</option>
                            <option value="high" className="bg-[#0b1120] text-white font-sans">High</option>
                            <option value="critical" className="bg-[#0b1120] text-white font-sans">Critical</option>
                          </select>
                        </label>
                        <div className="flex items-end pb-1.5 justify-start">
                          <div className="text-[11px] text-slate-400 italic text-left">
                            Normalizer converts alert fields directly into SOC Incident.
                          </div>
                        </div>
                      </div>

                      <label className="block text-left">
                        <span className="mb-2 block text-xs font-semibold text-slate-300">Alert Payload (JSON / Key-Values)</span>
                        <textarea
                          rows={6}
                          value={alertForm.alertPayload}
                          onChange={e => setAlertForm({...alertForm, alertPayload: e.target.value})}
                          className="glass-field font-mono text-xs rounded-2xl min-h-[140px] text-left"
                          placeholder="Paste JSON alert payload or log telemetry..."
                          required
                        />
                      </label>
                    </div>
                  )}

                  {(activeSource === 'Log File' || activeSource === 'PDF Report') && (
                    <div className="space-y-4 text-left">
                      <span className="block text-xs font-semibold text-slate-300">
                        Upload {activeSource === 'Log File' ? 'Log Telemetry' : 'PDF Threat Report'}
                      </span>
                      
                      <div 
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleFileDrop}
                        className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                          isDragOver 
                            ? 'border-blue-500 bg-blue-500/10' 
                            : 'border-slate-800 bg-white/[0.01] hover:border-slate-700'
                        }`}
                      >
                        <FiUploadCloud className={`w-10 h-10 mb-3 ${isDragOver ? 'text-blue-400' : 'text-slate-500'}`} />
                        <p className="text-sm text-slate-300 font-medium mb-1">
                          Drag and drop your file here, or click to browse
                        </p>
                        <p className="text-xs text-slate-500">
                          {activeSource === 'Log File' ? 'Supports .log, .txt, .json' : 'Supports .pdf reports'} (Max 10MB)
                        </p>
                        <label className="mt-4 glass-button text-xs py-2 px-4 cursor-pointer border-slate-700/50">
                          Browse File
                          <input
                            type="file"
                            accept={activeSource === 'Log File' ? '.log,.txt,.json' : '.pdf'}
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Display Ingested File Details */}
                      {((activeSource === 'Log File' && logForm.filename) || (activeSource === 'PDF Report' && pdfForm.filename)) && (
                        <div className="p-4 bg-white/[0.02] border border-slate-800 rounded-2xl flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FiFile className="w-5 h-5 text-blue-400" />
                              <div className="text-left">
                                <p className="text-xs font-semibold text-slate-300 truncate max-w-xs">
                                  {activeSource === 'Log File' ? logForm.filename : pdfForm.filename}
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono">
                                  {(((activeSource === 'Log File' ? logForm.filesize : pdfForm.filesize) || 0) / 1024).toFixed(2)} KB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (activeSource === 'Log File') setLogForm({ filename: '', filesize: 0, fileSnippet: '' });
                                else setPdfForm({ filename: '', filesize: 0, fileSnippet: '' });
                              }}
                              className="text-red-400 hover:text-red-300 bg-red-400/10 p-1.5 rounded-lg cursor-pointer"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Ingested Preview Data</span>
                            <pre className="mt-1 p-3 bg-slate-950/70 border border-slate-900 rounded-xl font-mono text-[10px] text-slate-400 overflow-x-auto max-h-[160px] text-left">
                              {activeSource === 'Log File' ? logForm.fileSnippet : pdfForm.fileSnippet}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeSource === 'Meeting Transcript' && (
                    <div className="space-y-4">
                      <label className="block text-left">
                        <span className="mb-2 block text-xs font-semibold text-slate-300">Participants (Optional)</span>
                        <input
                          type="text"
                          value={transcriptForm.participants}
                          onChange={e => setTranscriptForm({...transcriptForm, participants: e.target.value})}
                          className="glass-field text-left"
                          placeholder="e.g. Sarah Jenkins (Analyst), Bob Carter (Lead)"
                        />
                      </label>

                      <label className="block text-left">
                        <span className="mb-2 block text-xs font-semibold text-slate-300">Transcript Content</span>
                        <textarea
                          rows={8}
                          value={transcriptForm.transcript}
                          onChange={e => setTranscriptForm({...transcriptForm, transcript: e.target.value})}
                          className="glass-field rounded-2xl min-h-[200px] text-left"
                          placeholder="Paste dialog transcript, logs or war room text here..."
                          required
                        />
                      </label>
                    </div>
                  )}

                  {activeSource === 'Threat Intelligence Feed' && (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block text-left">
                          <span className="mb-2 block text-xs font-semibold text-slate-300">Indicator of Compromise (IOC)</span>
                          <input
                            type="text"
                            value={intelForm.iocText}
                            onChange={e => setIntelForm({...intelForm, iocText: e.target.value})}
                            className="glass-field text-left"
                            placeholder="e.g. update.windows-service.org (IP/Domain)"
                            required
                          />
                        </label>
                        <label className="block text-left">
                          <span className="mb-2 block text-xs font-semibold text-slate-300">CVE ID</span>
                          <input
                            type="text"
                            value={intelForm.cve}
                            onChange={e => setIntelForm({...intelForm, cve: e.target.value})}
                            className="glass-field text-left"
                            placeholder="e.g. CVE-2026-30219"
                          />
                        </label>
                      </div>

                      <label className="block text-left">
                        <span className="mb-2 block text-xs font-semibold text-slate-300">Threat Intel Report Details</span>
                        <textarea
                          rows={6}
                          value={intelForm.threatReport}
                          onChange={e => setIntelForm({...intelForm, threatReport: e.target.value})}
                          className="glass-field rounded-2xl min-h-[140px] text-left"
                          placeholder="Paste campaign description, threat actor details, file hashes, etc..."
                          required
                        />
                      </label>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-300 text-left leading-relaxed">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="primary-button w-full h-12 flex items-center justify-center gap-2 cursor-pointer font-bold"
              >
                {isLoading ? (
                  <>
                    <Loader />
                    Normalizing Telemetry...
                  </>
                ) : (
                  <>
                    Ingest & Unify Incident
                    <FiArrowRight className="w-4 h-4 ml-1 animate-pulse" />
                  </>
                )}
              </button>

            </form>
          </Card>
        </div>

        {/* Right Hand: Normalization Diagram & Ingestion Preview Payload */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Visual AI Pipeline */}
          <div className="glass-card p-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 mb-4 text-left">
              2. Normalization Flow Pipeline
            </h3>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-4 relative">
                
                {/* Node 1: Ingest Source */}
                <div className="flex items-center gap-4 bg-slate-900/40 border border-slate-800 rounded-xl p-3 relative group">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${activeSourceConfig.color} flex items-center justify-center text-white shadow-lg`}>
                    <ActiveIconComponent className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-200">Active Ingestion Source</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                      {activeSource}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center justify-center">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                  </div>
                </div>

                {/* Pulsing Connector Line 1 */}
                <div className="flex justify-center -my-2 z-10">
                  <div className="h-6 w-0.5 bg-slate-800 relative">
                    <motion.div 
                      animate={{ y: [-12, 12], opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-[-1.5px] top-0 w-[4px] h-3 bg-blue-400 rounded-full" 
                    />
                  </div>
                </div>

                {/* Node 2: Normalization */}
                <div className="flex items-center gap-4 bg-slate-900/40 border border-slate-800 rounded-xl p-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md">
                    <FiLayers className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-200">Normalization Engine</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Parses payload structure
                    </p>
                  </div>
                  <div className="ml-auto flex items-center justify-center">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                  </div>
                </div>

                {/* Pulsing Connector Line 2 */}
                <div className="flex justify-center -my-2 z-10">
                  <div className="h-6 w-0.5 bg-slate-800 relative">
                    <motion.div 
                      animate={{ y: [-12, 12], opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 0.5 }}
                      className="absolute left-[-1.5px] top-0 w-[4px] h-3 bg-purple-400 rounded-full" 
                    />
                  </div>
                </div>

                {/* Node 3: Planner */}
                <div className="flex items-center gap-4 bg-slate-900/40 border border-slate-800 rounded-xl p-3">
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
                    <FiCpu className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-200">AI Planner Agent</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Executes decisions & RAG
                    </p>
                  </div>
                  <div className="ml-auto flex items-center justify-center">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                  </div>
                </div>

                {/* Pulsing Connector Line 3 */}
                <div className="flex justify-center -my-2 z-10">
                  <div className="h-6 w-0.5 bg-slate-800 relative">
                    <motion.div 
                      animate={{ y: [-12, 12], opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 1.0 }}
                      className="absolute left-[-1.5px] top-0 w-[4px] h-3 bg-indigo-400 rounded-full" 
                    />
                  </div>
                </div>

                {/* Node 4: AI Agents */}
                <div className="flex items-center gap-4 bg-slate-900/40 border border-slate-800 rounded-xl p-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
                    <FiCheckCircle className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-200">AI Agents</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Mitigate, verify & log incident
                    </p>
                  </div>
                  <div className="ml-auto flex items-center justify-center">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Telemetry Payload Preview */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                3. Live Normalizer Telemetry
              </h3>
              <span className="text-[9px] uppercase tracking-wider bg-slate-800 border border-slate-700/60 rounded px-1.5 py-0.5 text-blue-400 font-bold font-mono">
                JSON Payload
              </span>
            </div>
            
            <pre className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-[300px] text-left leading-relaxed shadow-inner">
              {JSON.stringify(livePayload, null, 2)}
            </pre>
            
            <div className="mt-3 text-[10px] text-slate-500 italic text-left">
              * The Normalization Engine transforms this payload into structured parameters automatically.
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default CreateIncidentPage;
