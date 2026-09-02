import React, { useState } from 'react';
import { 
  Database, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  FileText, 
  RefreshCw, 
  ArrowRight,
  Code
} from 'lucide-react';
import { importFromFirebase } from '../services/api';

export default function FirebaseMigratorModal({ isOpen, onClose, onSuccess }) {
  if (!isOpen) return null;

  const [jsonText, setJsonText] = useState('');
  const [importing, setImporting] = useState(false);
  const [statusResult, setStatusResult] = useState(null);

  // Template sample JSON Firebase
  const sampleFirebaseJson = JSON.stringify([
    {
      "nis": "202601099",
      "nama": "Ahmad Fauzi Ridwan",
      "gender": "L",
      "kelas": "10 IPA 1 (KMI 4)",
      "kamar": "Asrama Abu Bakar No. 08",
      "alamat": "Jl. Kaliurang KM 12, Sleman",
      "namaWali": "H. Ridwan Kamil",
      "noHpWali": "081234567890",
      "saldo_saku": 150000,
      "status": "AKTIF"
    },
    {
      "nis": "202601100",
      "nama": "Zahra Salsabila",
      "gender": "P",
      "kelas": "11 IPS (KMI 5)",
      "kamar": "Asrama Khadijah No. 05",
      "alamat": "Kompleks Perumahan Candi Indah, Klaten",
      "namaWali": "Dr. Subroto",
      "noHpWali": "081987654321",
      "saldo_saku": 200000,
      "status": "AKTIF"
    }
  ], null, 2);

  const handleUseSample = () => {
    setJsonText(sampleFirebaseJson);
    setStatusResult(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setJsonText(event.target.result);
      setStatusResult(null);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (!jsonText.trim()) {
      setStatusResult({ type: 'error', message: 'Tempelkan atau upload file JSON Firebase terlebih dahulu' });
      return;
    }

    try {
      setImporting(true);
      setStatusResult(null);

      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch (err) {
        setStatusResult({ type: 'error', message: 'Format JSON tidak valid! Pastikan sintaks JSON benar.' });
        setImporting(false);
        return;
      }

      const res = await importFromFirebase(parsed);
      if (res.data.success) {
        setStatusResult({
          type: 'success',
          message: res.data.message,
          count: res.data.importedCount,
        });
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setStatusResult({
        type: 'error',
        message: err.response?.data?.message || 'Terjadi kesalahan saat memproses data Firebase'
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-amber-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Transmigrasi Data dari Firebase</h3>
              <p className="text-xs text-blue-100">Impor data santri dari Firebase Realtime DB / Firestore JSON</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-slate-50 text-xs">
          
          {statusResult && (
            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
              statusResult.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {statusResult.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium leading-relaxed">
                {statusResult.message}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label className="cursor-pointer px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File JSON</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
              
              <button
                type="button"
                onClick={handleUseSample}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-semibold transition-colors"
              >
                Gunakan Contoh JSON
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-mono">Format: Array JSON / Key-Value Map</span>
          </div>

          {/* Textarea JSON Input */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Editor / Payload JSON Firebase:
            </label>
            <textarea
              rows={12}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Tempelkan hasil ekspor JSON Firebase santri di sini..."
              className="w-full p-3.5 bg-white border border-slate-300 rounded-2xl font-mono text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Info Card */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl text-blue-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Pemetaan Field Data:</span>
            </div>
            <p className="text-[11px] text-blue-900/80 leading-relaxed">
              Sistem akan memetakan otomatis field: <code className="bg-white px-1 py-0.5 rounded border border-blue-200">nis</code>, <code className="bg-white px-1 py-0.5 rounded border border-blue-200">nama</code>, <code className="bg-white px-1 py-0.5 rounded border border-blue-200">kelas</code>, <code className="bg-white px-1 py-0.5 rounded border border-blue-200">kamar</code>, <code className="bg-white px-1 py-0.5 rounded border border-blue-200">alamat</code>, <code className="bg-white px-1 py-0.5 rounded border border-blue-200">namaWali</code>, <code className="bg-white px-1 py-0.5 rounded border border-blue-200">noHpWali</code>, dan <code className="bg-white px-1 py-0.5 rounded border border-blue-200">saldo_saku</code>. Jika santri sudah ada, data akan otomatis disinkronkan.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs"
          >
            Tutup
          </button>
          <button
            onClick={handleExecuteImport}
            disabled={importing || !jsonText.trim()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {importing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses Migrasi...</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5" />
                <span>Mulai Transmigrasi Data</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
