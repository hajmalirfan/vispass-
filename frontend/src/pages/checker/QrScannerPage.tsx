import { useCallback, useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion } from 'framer-motion';
import {
  ScanLine,
  Camera,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LogIn,
  LogOut,
  CalendarDays,
  MapPin,
  User as UserIcon,
  Hash,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';
import type { Registration } from '../../services/types';
import { PageHeader, ErrorBanner, StatusBadge, formatDate, formatDateTime } from '../../components/ui';

type ScanState = 'idle' | 'scanning' | 'scanningFailed' | 'verifying' | 'done' | 'error';

function extractToken(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.startsWith('VGP-')) return trimmed;
  const parts = trimmed.split('/');
  const last = parts[parts.length - 1];
  return last.startsWith('VGP-') ? last : null;
}

export const QrScannerPage: FC = () => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [cameraError, setCameraError] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [result, setResult] = useState<Registration | null>(null);
  const [busy, setBusy] = useState<'entry' | 'exit' | null>(null);
  const [error, setError] = useState('');
  const [lastToken, setLastToken] = useState('');

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // scanner already stopped
      }
      scannerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  const startScanner = async () => {
    setCameraError('');
    setScanState('scanning');
    try {
      await stopScanner();
      scannerRef.current = new Html5Qrcode('qr-reader', { verbose: false });
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (decodedText) => {
          const token = extractToken(decodedText);
          if (!token) {
            setCameraError('Scanned code is not a valid gate pass');
            return;
          }
          void verifyToken(token);
        },
        () => {
          // ignore per-frame decode errors
        }
      );
    } catch {
      setScanState('scanningFailed');
      setCameraError(
        'Could not access the camera. Please allow camera permission or paste the QR ID manually below.'
      );
    }
  };

  const stopCamera = async () => {
    await stopScanner();
    setScanState('idle');
  };

  const verifyToken = useCallback(async (token: string) => {
    setLastToken(token);
    setError('');
    setResult(null);
    setScanState('verifying');
    try {
      const reg = await api<Registration>(`/api/registrations/verify/${token}`);
      setResult(reg);
      setScanState('done');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setScanState('error');
    }
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = manualToken.trim();
    if (!token) return;
    setManualToken('');
    void verifyToken(token);
  };

  const mark = async (action: 'entry' | 'exit') => {
    if (!result) return;
    setBusy(action);
    setError('');
    try {
      const updated = await api<Registration>(`/api/registrations/${result.id}/${action}`, { method: 'PUT' });
      setResult(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to mark ${action}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="QR Scanner"
        subtitle="Scan a visitor's gate pass to verify entry"
        action={
          scanState === 'scanning' ? (
            <button
              onClick={stopCamera}
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Stop Camera
            </button>
          ) : (
            <button
              onClick={startScanner}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-colors"
            >
              <Camera className="w-4 h-4" />
              Open QR Scanner
            </button>
          )
        }
      />

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Scanner panel */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ScanLine className="w-4 h-4 text-blue-600" />
                Camera Scanner
              </h2>
              {scanState === 'scanning' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              )}
            </div>

            <div className="p-5">
              <div id="qr-reader" className={`w-full overflow-hidden rounded-xl ${scanState === 'scanning' ? '' : 'hidden'}`} />

              {scanState !== 'scanning' && (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                    <ScanLine className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    {scanState === 'scanningFailed' ? 'Camera unavailable' : 'Scanner is off'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 font-medium max-w-xs">
                    Click "Open QR Scanner" to start the camera and scan a visitor's QR pass.
                  </p>
                </div>
              )}

              {cameraError && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl text-xs font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Manual entry */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Paste QR ID manually</h3>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="e.g. VGP-xxxxxxxx"
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm text-gray-900 placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={!manualToken.trim() || scanState === 'verifying'}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {scanState === 'verifying' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Verify
              </button>
            </form>
          </div>
        </div>

        {/* Result panel */}
        <div className="space-y-5">
          {scanState === 'verifying' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
              <p className="text-sm font-semibold text-gray-700">Verifying pass...</p>
            </div>
          )}

          {scanState === 'done' && result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden"
            >
              <div className="h-1.5 bg-gradient-to-r from-blue-600 to-sky-400" />
              <div className="p-6 md:p-7">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-bold">Valid Pass</span>
                  </div>
                  <StatusBadge status={result.status} />
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xl">
                    {result.visitor_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{result.visitor_name}</h3>
                    <p className="text-sm text-gray-500 font-medium">{result.visitor_email || 'No email on record'}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <CalendarDays className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Event</p>
                      <p className="font-bold text-gray-900">{result.event?.title ?? `Event #${result.event_id}`}</p>
                      <p className="text-xs text-gray-500 font-medium">{formatDate(result.event?.event_date ?? null)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Location</p>
                      <p className="font-bold text-gray-900">{result.event?.location || 'No location set'}</p>
                      {result.purpose && <p className="text-xs text-gray-500 font-medium">{result.purpose}</p>}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <Hash className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">QR ID</p>
                      <p className="font-mono text-xs font-semibold text-gray-900 break-all">{result.qr_code ?? '—'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Organization</p>
                      <p className="font-bold text-gray-900">{result.organization || '—'}</p>
                      {result.phone && <p className="text-xs text-gray-500 font-medium">{result.phone}</p>}
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-6 p-4 rounded-xl bg-gray-50">
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Entry Time</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      {result.checked_in_at ? formatDateTime(result.checked_in_at) : 'Not entered yet'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Exit Time</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                      {result.checked_out_at ? formatDateTime(result.checked_out_at) : 'Not exited'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => mark('entry')}
                    disabled={busy !== null || result.checked_in}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {busy === 'entry' ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                    {result.checked_in ? 'Entry Marked' : 'Mark Entry'}
                  </motion.button>
                  <button
                    onClick={() => mark('exit')}
                    disabled={busy !== null || !result.checked_in || result.checked_out}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {busy === 'exit' ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                    {result.checked_out ? 'Exit Marked' : 'Mark Exit'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {scanState === 'error' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                <XCircle className="w-7 h-7 text-red-500" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Invalid or expired gate pass</p>
              <p className="text-xs text-gray-400 mt-1 font-medium max-w-xs">
                The scanned code could not be verified. Check that the pass was approved.
              </p>
              {lastToken && (
                <p className="mt-3 font-mono text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">{lastToken}</p>
              )}
            </div>
          )}

          {(scanState === 'idle' || scanState === 'scanning' || scanState === 'scanningFailed') && !result && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <ScanLine className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Scan a pass to verify</p>
              <p className="text-xs text-gray-400 mt-1 font-medium max-w-sm">
                Visitor details, verification status, and entry/exit times will appear here after scanning.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrScannerPage;
