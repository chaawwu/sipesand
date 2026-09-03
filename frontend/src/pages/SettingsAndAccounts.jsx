import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Settings, 
  Users, 
  CreditCard, 
  Database, 
  Download, 
  CheckCircle2, 
  Save, 
  Plus, 
  Trash2, 
  Upload, 
  Image, 
  X, 
  Radio, 
  ShieldCheck, 
  Key, 
  FileSpreadsheet,
  Globe,
  ToggleLeft,
  ToggleRight,
  Wallet,
  CheckSquare,
  Square,
  Edit
} from 'lucide-react';
import { 
  getUserAccounts, 
  createUserAccount, 
  updateUserAccount,
  deleteUserAccount, 
  getBackupData,
  getSantriList,
  resetTenantData
} from '../services/api';
import { clearTenantData } from '../services/firestoreService';
import { useSettings } from '../context/SettingsContext';

const DIVISION_ROLES = [
  { 
    id: 'SUPER_ADMIN', 
    label: 'Super Admin', 
    division: 'PUSAT', 
    desc: 'Akses penuh seluruh modul, keuangan, dan pengaturan sistem' 
  },
  { 
    id: 'KEPALA_PONDOK', 
    label: 'Kepala Pondok (Pengasuh)', 
    division: 'PENGASUHAN', 
    desc: 'Monitoring santri/pengurus, koordinasi, muhafadzoh, pemetaan uang saku, perizinan' 
  },
  { 
    id: 'BENDAHARA', 
    label: 'Bendahara Keuangan', 
    division: 'KEUANGAN', 
    desc: 'Input kas umum, master & tagihan massal, ACC verifikasi online, follow-up tagihan WA' 
  },
  { 
    id: 'PENGURUS_SAKU', 
    label: 'Pengurus Uang Saku', 
    division: 'ASRAMA_POS', 
    desc: 'Input harian setor/tarik (uang cash dipegang pengurus), pantau saldo minus, follow-up WA' 
  },
  { 
    id: 'KEAMANAN', 
    label: 'Divisi Keamanan (Kamtib)', 
    division: 'KAMTIB', 
    desc: 'Input perizinan keluar/pulang, deteksi overdue, catatan pelanggaran & takziran' 
  },
];

export default function SettingsAndAccounts() {
  const { settings: globalSettings, updateSettings, isNfcEnabled, toggleNfc } = useSettings();
  const [subTab, setSubTab] = useState('identity'); // 'identity' | 'assets' | 'nfc' | 'payment' | 'accounts' | 'backup'
  
  // Local form state synced with global context
  const [formSettings, setFormSettings] = useState(globalSettings);
  const [accounts, setAccounts] = useState([]);
  const [santriList, setSantriList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modal Account State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountFormData, setAccountFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'PENGURUS_SAKU',
    division: 'ASRAMA_POS',
  });

  // Modal Pemetaan Santri Asuh State
  const [mappingAccount, setMappingAccount] = useState(null);
  const [selectedSantriIds, setSelectedSantriIds] = useState([]);
  const [savingMapping, setSavingMapping] = useState(false);

  // Modal Evaluasi Pengurus State
  const [evaluatingAccount, setEvaluatingAccount] = useState(null);
  const [evalNotes, setEvalNotes] = useState('');
  const [evalGrade, setEvalGrade] = useState('Mumtaz');

  useEffect(() => {
    setFormSettings(globalSettings);
  }, [globalSettings]);

  useEffect(() => {
    loadAccountsAndSantri();
  }, []);

  const loadAccountsAndSantri = async () => {
    try {
      setLoading(true);
      const [accRes, santriRes] = await Promise.all([
        getUserAccounts(),
        getSantriList(),
      ]);

      if (accRes.data.success) setAccounts(accRes.data.data);
      if (santriRes.data.success) setSantriList(santriRes.data.data);
    } catch (err) {
      console.error('Error loadAccountsAndSantri:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e?.preventDefault();
    try {
      const res = await updateSettings(formSettings);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert('Gagal menyimpan pengaturan');
    }
  };

  // Image Upload Helper to Data URL (Base64)
  const handleImageUpload = (key, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const updated = { ...formSettings, [key]: event.target.result };
      setFormSettings(updated);
      updateSettings(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const res = await createUserAccount(accountFormData);
      if (res.data.success) {
        setIsAccountModalOpen(false);
        setAccountFormData({ username: '', password: '', name: '', role: 'PENGURUS_SAKU', division: 'ASRAMA_POS' });
        loadAccountsAndSantri();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat akun');
    }
  };

  const handleDeleteAccount = async (id, name) => {
    if (window.confirm(`Hapus akun pengurus "${name}"?`)) {
      try {
        await deleteUserAccount(id);
        loadAccountsAndSantri();
      } catch (err) {
        alert('Gagal menghapus akun');
      }
    }
  };

  // Handler Buka Modal Pemetaan Santri Asuh
  const handleOpenMapping = (acc) => {
    setMappingAccount(acc);
    try {
      const ids = typeof acc.managedSantriIds === 'string' 
        ? JSON.parse(acc.managedSantriIds) 
        : (Array.isArray(acc.managedSantriIds) ? acc.managedSantriIds : []);
      setSelectedSantriIds(ids);
    } catch (e) {
      setSelectedSantriIds([]);
    }
  };

  const handleToggleSantriMapping = (santriId) => {
    setSelectedSantriIds(prev => 
      prev.includes(santriId) ? prev.filter(id => id !== santriId) : [...prev, santriId]
    );
  };

  const handleSaveMapping = async () => {
    if (!mappingAccount) return;
    try {
      setSavingMapping(true);
      await updateUserAccount(mappingAccount.id, {
        managedSantriIds: selectedSantriIds,
      });
      setMappingAccount(null);
      loadAccountsAndSantri();
    } catch (err) {
      alert('Gagal menyimpan pemetaan santri');
    } finally {
      setSavingMapping(false);
    }
  };

  // Handler Evaluasi Pengurus
  const handleOpenEvaluation = (acc) => {
    setEvaluatingAccount(acc);
    setEvalNotes(acc.performanceNotes || '');
    setEvalGrade(acc.performanceGrade || 'Mumtaz');
  };

  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    if (!evaluatingAccount) return;
    try {
      await updateUserAccount(evaluatingAccount.id, {
        performanceNotes: evalNotes,
        performanceGrade: evalGrade,
      });
      setEvaluatingAccount(null);
      loadAccountsAndSantri();
    } catch (err) {
      alert('Gagal menyimpan evaluasi');
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const res = await getBackupData();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `sipesand_database_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Gagal mengunduh backup database');
    }
  };

  const handleRestartTenantData = async () => {
    if (!window.confirm('PERINGATAN: Apakah Anda yakin ingin me-restart seluruh data tenant ini menjadi 0 data bersih? Tindakan ini akan mengosongkan seluruh data santri & transaksi di semua device.')) {
      return;
    }
    try {
      await resetTenantData();
      clearTenantData();
      alert('Data tenant berhasil di-restart menjadi 0 data bersih di seluruh device.');
      window.location.reload();
    } catch (e) {
      alert('Gagal me-restart data tenant: ' + (e?.message || 'Error'));
    }
  };

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Top Header & Sub-Tabs Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSubTab('identity')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'identity' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Identitas Lembaga</span>
          </button>

          <button
            onClick={() => setSubTab('assets')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'assets' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>Upload Foto Logo, Cap & TTD</span>
          </button>

          <button
            onClick={() => setSubTab('nfc')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'nfc' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Sistem NFC / RFID</span>
          </button>

          <button
            onClick={() => setSubTab('payment')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'payment' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Rekening & QRIS</span>
          </button>

          <button
            onClick={() => setSubTab('accounts')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'accounts' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Akun Devisi & Pemetaan Saku</span>
          </button>

          <button
            onClick={() => setSubTab('backup')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'backup' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Backup Data JSON</span>
          </button>
        </div>

        {saveSuccess && (
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pengaturan Berhasil Disimpan & Diperbarui</span>
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* 1. SUB-TAB IDENTITAS LEMBAGA                                            */}
      {/* ======================================================================= */}
      {subTab === 'identity' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Identitas & Profil Pesantren</h3>
              <p className="text-slate-400 text-[11px]">Otomatis merubah nama di website, header navbar, kwitansi resmi, dan ID Card santri</p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lembaga Pesantren *</label>
              <input
                type="text"
                required
                value={formSettings.NAMA_LEMBAGA || ''}
                onChange={(e) => setFormSettings({ ...formSettings, NAMA_LEMBAGA: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tagline / Semboyan</label>
              <input
                type="text"
                value={formSettings.TAGLINE_LEMBAGA || ''}
                onChange={(e) => setFormSettings({ ...formSettings, TAGLINE_LEMBAGA: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap</label>
            <input
              type="text"
              value={formSettings.ALAMAT_LEMBAGA || ''}
              onChange={(e) => setFormSettings({ ...formSettings, ALAMAT_LEMBAGA: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">No. Telepon Kantor</label>
              <input
                type="text"
                value={formSettings.NO_TELP || ''}
                onChange={(e) => setFormSettings({ ...formSettings, NO_TELP: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp Center</label>
              <input
                type="text"
                value={formSettings.WHATSAPP_CENTER || ''}
                onChange={(e) => setFormSettings({ ...formSettings, WHATSAPP_CENTER: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Website Resmi</label>
              <input
                type="text"
                value={formSettings.WEBSITE_LEMBAGA || ''}
                onChange={(e) => setFormSettings({ ...formSettings, WEBSITE_LEMBAGA: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Kepala Pondok (Pengasuh)</label>
              <input
                type="text"
                value={formSettings.NAMA_KEPALA_PONDOK || ''}
                onChange={(e) => setFormSettings({ ...formSettings, NAMA_KEPALA_PONDOK: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Bendahara Pesantren</label>
              <input
                type="text"
                value={formSettings.NAMA_BENDAHARA || ''}
                onChange={(e) => setFormSettings({ ...formSettings, NAMA_BENDAHARA: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600 font-bold"
              />
            </div>
          </div>
        </form>
      )}

      {/* ======================================================================= */}
      {/* 2. SUB-TAB UPLOAD FOTO LOGO, CAP STEMPEL, TTD & QRIS                    */}
      {/* ======================================================================= */}
      {subTab === 'assets' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Upload Aset Digital Pesantren</h3>
              <p className="text-slate-400 text-[11px]">
                File yang diunggah otomatis mengubah logo web navbar, ID Card KTSD, kwitansi sah, dan QRIS portal wali
              </p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Seluruh Aset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* 1. Upload Logo Pondok */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-800 block text-xs">1. Foto Logo Pondok</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Tampil di header portal, sidebar & ID Card KTSD</p>
                {formSettings.LOGO_PONDOK_URL && (
                  <div className="mt-2 h-20 flex items-center justify-center bg-white rounded-lg border border-slate-200 p-1">
                    <img src={formSettings.LOGO_PONDOK_URL} alt="Logo" className="max-h-16 object-contain" />
                  </div>
                )}
              </div>
              <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-lg flex items-center justify-center gap-1.5 text-center shadow-sm">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Pilih Foto Logo</span>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload('LOGO_PONDOK_URL', e)} className="hidden" />
              </label>
            </div>

            {/* 2. Upload Cap Stempel Pondok */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-800 block text-xs">2. File Cap Stempel Pondok</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Stempel basah digital transparan pada Kwitansi Resmi</p>
                {formSettings.CAP_STEMPEL_URL && (
                  <div className="mt-2 h-20 flex items-center justify-center bg-white rounded-lg border border-slate-200 p-1">
                    <img src={formSettings.CAP_STEMPEL_URL} alt="Cap Stempel" className="max-h-16 object-contain" />
                  </div>
                )}
              </div>
              <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-lg flex items-center justify-center gap-1.5 text-center shadow-sm">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Pilih File Cap Stempel</span>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload('CAP_STEMPEL_URL', e)} className="hidden" />
              </label>
            </div>

            {/* 3. Upload TTD Kepala Pondok */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-800 block text-xs">3. File TTD Kepala Pondok</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Tanda tangan digital pada ID Card santri</p>
                {formSettings.TTD_KEPALA_URL && (
                  <div className="mt-2 h-20 flex items-center justify-center bg-white rounded-lg border border-slate-200 p-1">
                    <img src={formSettings.TTD_KEPALA_URL} alt="TTD Kepala" className="max-h-16 object-contain" />
                  </div>
                )}
              </div>
              <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-lg flex items-center justify-center gap-1.5 text-center shadow-sm">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Pilih File TTD Kepala</span>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload('TTD_KEPALA_URL', e)} className="hidden" />
              </label>
            </div>

            {/* 4. Upload TTD Bendahara */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-800 block text-xs">4. File TTD Bendahara</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Tanda tangan digital pada Kwitansi Pembayaran</p>
                {formSettings.TTD_BENDAHARA_URL && (
                  <div className="mt-2 h-20 flex items-center justify-center bg-white rounded-lg border border-slate-200 p-1">
                    <img src={formSettings.TTD_BENDAHARA_URL} alt="TTD Bendahara" className="max-h-16 object-contain" />
                  </div>
                )}
              </div>
              <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-lg flex items-center justify-center gap-1.5 text-center shadow-sm">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Pilih File TTD Bendahara</span>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload('TTD_BENDAHARA_URL', e)} className="hidden" />
              </label>
            </div>

            {/* 5. Upload File QRIS */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-800 block text-xs">5. File Gambar QRIS Resmi</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Gambar QRIS statis untuk scan pembayaran wali</p>
                {formSettings.QRIS_PAYMENT_URL && (
                  <div className="mt-2 h-20 flex items-center justify-center bg-white rounded-lg border border-slate-200 p-1">
                    <img src={formSettings.QRIS_PAYMENT_URL} alt="QRIS" className="max-h-16 object-contain" />
                  </div>
                )}
              </div>
              <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-lg flex items-center justify-center gap-1.5 text-center shadow-sm">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Pilih File QRIS</span>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload('QRIS_PAYMENT_URL', e)} className="hidden" />
              </label>
            </div>

          </div>
        </form>
      )}

      {/* ======================================================================= */}
      {/* 3. SUB-TAB SISTEM NFC / RFID (AKTIF / NON-AKTIF TOGGLE)                 */}
      {/* ======================================================================= */}
      {subTab === 'nfc' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Pengaturan Sistem Smart NFC / RFID Reader</h3>
            <p className="text-slate-400 text-[11px]">
              Aktifkan atau nonaktifkan fitur pemindaian kartu NFC/RFID di seluruh aplikasi SiPesand
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Radio className={`w-4 h-4 ${isNfcEnabled ? 'text-[#1D4ED8]' : 'text-slate-400'}`} />
                <span className="font-bold text-sm text-slate-900">
                  Status Fitur NFC / RFID Reader: <strong className={isNfcEnabled ? 'text-emerald-700' : 'text-slate-500'}>{isNfcEnabled ? 'AKTIF' : 'NON-AKTIF'}</strong>
                </span>
              </div>
              <p className="text-slate-500 text-[11px] max-w-xl leading-relaxed">
                {isNfcEnabled 
                  ? 'Modul NFC aktif: Scanner reader di portal utama, POS kasir, input saku, dan perizinan dapat digunakan.' 
                  : 'Modul NFC dinonaktifkan: Sistem beroperasi dalam mode pencarian manual (NIS/Nama) tanpa tombol NFC reader.'}
              </p>
            </div>

            <button
              type="button"
              onClick={toggleNfc}
              className={`px-5 py-2.5 rounded-xl font-bold text-white transition-all flex items-center gap-2 shadow-sm ${
                isNfcEnabled ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700 hover:bg-slate-800'
              }`}
            >
              {isNfcEnabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              <span>{isNfcEnabled ? 'NFC Aktif (Klik untuk Matikan)' : 'NFC Nonaktif (Klik untuk Aktifkan)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 4. SUB-TAB REKENING & KING DIGITAL PAYMENT GATEWAY (AUTO-DISBURSEMENT) */}
      {/* ======================================================================= */}
      {subTab === 'payment' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* Card 1: Rekening Resmi Pembayaran Manual Pesantren */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Rekening Resmi Pembayaran Pesantren (Manual Transfer)</h3>
                <p className="text-slate-400 text-[11px]">Muncul pada Portal Wali santri saat memilih metode bayar transfer langsung</p>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Bank Syariah *</label>
                <input
                  type="text"
                  required
                  value={formSettings.BANK_NAME || ''}
                  onChange={(e) => setFormSettings({ ...formSettings, BANK_NAME: e.target.value })}
                  placeholder="Bank Syariah Indonesia (BSI)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Rekening *</label>
                <input
                  type="text"
                  required
                  value={formSettings.BANK_ACCOUNT_NO || ''}
                  onChange={(e) => setFormSettings({ ...formSettings, BANK_ACCOUNT_NO: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600 font-mono font-bold text-blue-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Atas Nama Rekening *</label>
                <input
                  type="text"
                  required
                  value={formSettings.BANK_ACCOUNT_HOLDER || ''}
                  onChange={(e) => setFormSettings({ ...formSettings, BANK_ACCOUNT_HOLDER: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Integrasi King Digital Payment Gateway & Auto-Disbursement */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <h3 className="font-extrabold text-base text-white">King Digital Payment Gateway (Auto-Disbursement)</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    formSettings.KING_DIGITAL_PG_ENABLED === 'true'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {formSettings.KING_DIGITAL_PG_ENABLED === 'true' ? 'Aktif • Auto-Disburse' : 'Non-Aktif'}
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
                  Layanan Payment Gateway terintegrasi dari <strong>King Digital Payment</strong>. Pembayaran tagihan Syahriyah oleh wali santri akan diverifikasi instan dan saldo secara otomatis dicairkan (*auto-disburse*) ke rekening penampungan pesantren Anda.
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => {
                  const newVal = formSettings.KING_DIGITAL_PG_ENABLED === 'true' ? 'false' : 'true';
                  const updated = { ...formSettings, KING_DIGITAL_PG_ENABLED: newVal };
                  setFormSettings(updated);
                  updateSettings(updated);
                }}
                className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 flex-shrink-0 shadow-lg ${
                  formSettings.KING_DIGITAL_PG_ENABLED === 'true'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {formSettings.KING_DIGITAL_PG_ENABLED === 'true' ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                <span>{formSettings.KING_DIGITAL_PG_ENABLED === 'true' ? 'PG Aktif (Klik untuk Matikan)' : 'PG Nonaktif (Klik untuk Aktifkan)'}</span>
              </button>
            </div>

            {/* Form Rekening Auto-Disbursement */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-blue-300 uppercase tracking-wider">Rekening Tujuan Pencairan Otomatis (Auto-Disbursement)</span>
                <span className="text-[10px] text-slate-400 font-mono">Settlement: Instan Real-Time</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-900">
                <div>
                  <label className="block font-bold text-slate-200 text-xs mb-1">Bank Penampungan Pencairan</label>
                  <select
                    value={formSettings.DISBURSEMENT_BANK || 'Bank Syariah Indonesia (BSI)'}
                    onChange={(e) => setFormSettings({ ...formSettings, DISBURSEMENT_BANK: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-1 focus:ring-blue-600 text-xs font-bold"
                  >
                    <option value="Bank Syariah Indonesia (BSI)">Bank Syariah Indonesia (BSI)</option>
                    <option value="Bank Central Asia (BCA)">Bank Central Asia (BCA)</option>
                    <option value="Bank Mandiri">Bank Mandiri</option>
                    <option value="Bank Rakyat Indonesia (BRI)">Bank Rakyat Indonesia (BRI)</option>
                    <option value="Bank Negara Indonesia (BNI)">Bank Negara Indonesia (BNI)</option>
                    <option value="Bank Muamalat">Bank Muamalat</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-200 text-xs mb-1">Nomor Rekening Lembaga</label>
                  <input
                    type="text"
                    value={formSettings.DISBURSEMENT_ACCOUNT_NO || ''}
                    onChange={(e) => setFormSettings({ ...formSettings, DISBURSEMENT_ACCOUNT_NO: e.target.value })}
                    placeholder="Contoh: 7192837465"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-1 focus:ring-blue-600 font-mono font-bold text-blue-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-200 text-xs mb-1">Nama Pemilik Rekening Yayasan</label>
                  <input
                    type="text"
                    value={formSettings.DISBURSEMENT_ACCOUNT_HOLDER || ''}
                    onChange={(e) => setFormSettings({ ...formSettings, DISBURSEMENT_ACCOUNT_HOLDER: e.target.value })}
                    placeholder="Contoh: YAYASAN PONDOK PESANTREN"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-1 focus:ring-blue-600 font-bold text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  Saat fitur ini <strong>AKTIF</strong>, setiap wali santri yang membayar via QRIS/VA King Digital Payment akan langsung terverifikasi lunas secara otomatis tanpa perlu ACC manual oleh bendahara, dan dana diteruskan ke rekening penampungan di atas.
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 text-xs"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Konfigurasi Payment Gateway</span>
              </button>
            </div>

          </div>

        </form>
      )}

      {/* ======================================================================= */}
      {/* 5. SUB-TAB AKUN PENGURUS DEVISI & PEMETAAN SANTRI ASUH                  */}
      {/* ======================================================================= */}
      {subTab === 'accounts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Manajemen Akun Devisi, Pemetaan Saku & Evaluasi Kinerja</h3>
              <p className="text-slate-400 text-[11px]">
                Kelola akun devisi, petakan santri asuh uang saku per pengurus, dan berikan penilaian kinerja asatidz.
              </p>
            </div>
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Akun Devisi Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Nama Pengurus</th>
                  <th className="py-3.5 px-4">Username</th>
                  <th className="py-3.5 px-4">Devisi / Role</th>
                  <th className="py-3.5 px-4">Santri Asuh Uang Saku</th>
                  <th className="py-3.5 px-4">Predikat & Evaluasi</th>
                  <th className="py-3.5 px-4 text-center">Aksi & Pemetaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((acc) => {
                  const roleMeta = DIVISION_ROLES.find(r => r.id === acc.role);
                  let managedCount = 0;
                  try {
                    const parsed = typeof acc.managedSantriIds === 'string' ? JSON.parse(acc.managedSantriIds) : acc.managedSantriIds;
                    if (Array.isArray(parsed)) managedCount = parsed.length;
                  } catch (e) {}

                  return (
                    <tr key={acc.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{acc.name}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{acc.username}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          {roleMeta?.label || acc.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          managedCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {managedCount > 0 ? `${managedCount} Santri Binaan` : 'Semua Santri (Bebas)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 text-[11px]">{acc.performanceGrade || 'Mumtaz'}</div>
                        <div className="text-[10px] text-slate-400 max-w-xs truncate">{acc.performanceNotes || 'Belum ada evaluasi'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenMapping(acc)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
                            title="Petakan Santri Asuh Uang Saku"
                          >
                            <Wallet className="w-3 h-3" />
                            <span>Petakan Santri</span>
                          </button>

                          <button
                            onClick={() => handleOpenEvaluation(acc)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition-colors"
                            title="Beri Catatan Evaluasi"
                          >
                            Evaluasi
                          </button>

                          <button
                            onClick={() => handleDeleteAccount(acc.id, acc.name)}
                            className="p-1 text-slate-400 hover:text-rose-700 rounded transition-colors"
                            title="Hapus Akun"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 6. SUB-TAB AUTO BACKUP DATA JSON                                        */}
      {/* ======================================================================= */}
      {subTab === 'backup' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Cadangan Database & Integrasi Google Sheets</h3>
            <p className="text-slate-400 text-[11px]">Amankan seluruh data santri, kas umum, dan transaksi saku</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Unduh Salinan Cadangan JSON</h4>
                <p className="text-slate-500 mt-1">
                  Ekspor instan seluruh database dalam format JSON siap restore.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadBackup}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Cadangan Database (.json)</span>
              </button>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Tautan Google Sheets</h4>
                <p className="text-slate-500 mt-1">
                  Sinkronisasi spreadsheet Google Sheets untuk rekonsiliasi kas umum secara online.
                </p>
                <input
                  type="text"
                  value={formSettings.GOOGLE_SHEET_SYNC_URL || ''}
                  onChange={(e) => setFormSettings({ ...formSettings, GOOGLE_SHEET_SYNC_URL: e.target.value })}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-1 focus:ring-blue-600 font-mono text-[11px] mt-2"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Tautan Spreadsheet</span>
              </button>
            </div>
          </div>

          {/* Zona Bahaya: Restart / Kosongkan Data Tenant */}
          <div className="p-5 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
            <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Zona Bahaya: Restart Seluruh Data Tenant (0 Data Bersih)</span>
            </div>
            <p className="text-rose-700 text-[11px] leading-relaxed">
              Tindakan ini akan mengosongkan seluruh data santri, tagihan, dan transaksi saku di server pusat serta di seluruh device (Laptop, HP Wali, dan Petugas). Gunakan fitur ini jika Anda ingin memulai ulang data pondok pesantren dari awal.
            </p>
            <button
              type="button"
              onClick={handleRestartTenantData}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 text-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Restart & Bersihkan Data Tenant ke 0 Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Dialog Pemetaan Santri Asuh */}
      {mappingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Pemetaan Santri Asuh: {mappingAccount.name}</h3>
                <p className="text-[11px] text-slate-400">Pilih santri yang uang sakunya dikelola pengurus ini</p>
              </div>
              <button onClick={() => setMappingAccount(null)} className="text-white hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 overflow-y-auto flex-1">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-700">{selectedSantriIds.length} Santri Terpilih</span>
                <span className="text-[11px] text-slate-400">Total {santriList.length} Santri</span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {santriList.map((s) => {
                  const isChecked = selectedSantriIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleToggleSantriMapping(s.id)}
                      className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{s.nama}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            NIS: {s.nis} • {s.kelas}
                          </div>
                        </div>
                      </div>

                      <span className={`font-mono font-bold ${s.saldo_saku < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                        Rp {s.saldo_saku?.toLocaleString('id-ID')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMappingAccount(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveMapping}
                disabled={savingMapping}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
              >
                {savingMapping ? 'Menyimpan...' : 'Simpan Pemetaan Santri'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog Evaluasi Pengurus */}
      {evaluatingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Evaluasi Kinerja: {evaluatingAccount.name}</h3>
              <button onClick={() => setEvaluatingAccount(null)} className="text-white hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEvaluation} className="p-5 space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Predikat Kinerja</label>
                <select
                  value={evalGrade}
                  onChange={(e) => setEvalGrade(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-1 focus:ring-blue-600 font-bold"
                >
                  <option value="Mumtaz">Mumtaz (Sangat Baik / Istimewa)</option>
                  <option value="Jayyid Jiddan">Jayyid Jiddan (Baik Sekali)</option>
                  <option value="Jayyid">Jayyid (Baik / Cukup)</option>
                  <option value="Perlu Pembinaan">Perlu Pembinaan</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Evaluasi Pengurus</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Catatan kedisiplinan dan evaluasi kinerja pengurus..."
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEvaluatingAccount(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Simpan Evaluasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Form Tambah Akun Pengurus */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Buat Akun Devisi Baru</h3>
              <button onClick={() => setIsAccountModalOpen(false)} className="text-white hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAccount} className="p-5 space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Pengurus *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ustadz Ridwan Santoso"
                  value={accountFormData.name}
                  onChange={(e) => setAccountFormData({ ...accountFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username Login *</label>
                <input
                  type="text"
                  required
                  placeholder="ridwan_saku"
                  value={accountFormData.username}
                  onChange={(e) => setAccountFormData({ ...accountFormData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={accountFormData.password}
                  onChange={(e) => setAccountFormData({ ...accountFormData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Devisi / Tipe Akun *</label>
                <select
                  value={accountFormData.role}
                  onChange={(e) => {
                    const sel = DIVISION_ROLES.find(r => r.id === e.target.value);
                    setAccountFormData({
                      ...accountFormData,
                      role: e.target.value,
                      division: sel?.division || 'PUSAT',
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-1 focus:ring-blue-600 font-semibold"
                >
                  {DIVISION_ROLES.map(r => (
                    <option key={r.id} value={r.id}>{r.label} ({r.division})</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Buat Akun Pengurus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
