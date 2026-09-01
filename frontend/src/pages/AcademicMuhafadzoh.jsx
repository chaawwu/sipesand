import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  BookOpen, 
  CheckCircle2, 
  X, 
  Users, 
  Calendar, 
  Wallet, 
  ShieldCheck, 
  Star, 
  UserCheck, 
  AlertTriangle,
  Clock,
  Send,
  MessageSquare,
  CheckSquare,
  Square,
  Save,
  Check
} from 'lucide-react';
import { 
  getAcademicRecords, 
  createAcademicRecord, 
  updateAcademicRecord, 
  deleteAcademicRecord,
  getSantriList,
  getDashboardStats,
  getUserAccounts,
  createUserAccount,
  updateUserAccount,
  getPermits,
  updatePermitStatus
} from '../services/api';

const RECORD_TYPES = [
  { id: 'MUHAFADZOH_QURAN', label: 'Hafalan Al-Qur\'an (Tahfidz)' },
  { id: 'SETORAN_KITAB', label: 'Setoran Kitab Kuning / Matan' },
  { id: 'NILAI_AKADEMIK', label: 'Nilai Ujian & Akademik KMI' },
  { id: 'EVALUASI_SIKAP', label: 'Evaluasi Sikap, Adab & Ibadah' },
];

const DIVISION_ROLES = [
  { id: 'SUPER_ADMIN', label: 'Super Admin', division: 'PUSAT' },
  { id: 'KEPALA_PONDOK', label: 'Kepala Pondok (Pengasuh)', division: 'PENGASUHAN' },
  { id: 'BENDAHARA', label: 'Bendahara Keuangan', division: 'KEUANGAN' },
  { id: 'PENGURUS_SAKU', label: 'Pengurus Uang Saku', division: 'ASRAMA_POS' },
  { id: 'KEAMANAN', label: 'Divisi Keamanan (Kamtib)', division: 'KAMTIB' },
];

export default function AcademicMuhafadzoh() {
  const [subTab, setSubTab] = useState('muhafadzoh'); // 'muhafadzoh' | 'pocket-map' | 'pengurus' | 'permits'
  
  // Data States
  const [records, setRecords] = useState([]);
  const [santriList, setSantriList] = useState([]);
  const [pengurusList, setPengurusList] = useState([]);
  const [permitsList, setPermitsList] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Pemetaan Uang Saku State
  const [selectedStaffForMapping, setSelectedStaffForMapping] = useState(null);
  const [selectedSantriForMapping, setSelectedSantriForMapping] = useState([]);
  const [mappingSuccess, setMappingSuccess] = useState(false);

  // Evaluasi Pengurus Modal / State
  const [evaluatingStaff, setEvaluatingStaff] = useState(null);
  const [evalNotes, setEvalNotes] = useState('');
  const [evalGrade, setEvalGrade] = useState('Mumtaz');
  const [evalSuccess, setEvalSuccess] = useState(false);

  // Buat Akun Devisi Modal State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountFormData, setAccountFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'PENGURUS_SAKU',
    division: 'ASRAMA_POS',
  });

  // Modal Form Muhafadzoh
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    santriId: '',
    type: 'MUHAFADZOH_QURAN',
    title: '',
    achievement: '',
    score: '95',
    grade: 'Mumtaz',
    notes: '',
    assessedBy: 'K.H. Syarif Hidayatullah, M.A. (Kepala Pondok)',
    date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    loadData();
  }, [typeFilter, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (search) params.search = search;

      const [recordsRes, santriRes, statsRes, accountsRes, permitsRes] = await Promise.all([
        getAcademicRecords(params),
        getSantriList(),
        getDashboardStats(),
        getUserAccounts(),
        getPermits(),
      ]);

      if (recordsRes.data.success) setRecords(recordsRes.data.data);
      if (santriRes.data.success) {
        setSantriList(santriRes.data.data);
        if (!formData.santriId && santriRes.data.data.length > 0) {
          setFormData(prev => ({ ...prev, santriId: santriRes.data.data[0].id.toString() }));
        }
      }
      if (statsRes.data.success) setStatsData(statsRes.data.data.stats);
      if (accountsRes.data.success) {
        setPengurusList(accountsRes.data.data);
        if (!selectedStaffForMapping && accountsRes.data.data.length > 0) {
          const firstPocketStaff = accountsRes.data.data.find(a => a.role === 'PENGURUS_SAKU') || accountsRes.data.data[0];
          setSelectedStaffForMapping(firstPocketStaff);
          try {
            const initialIds = typeof firstPocketStaff.managedSantriIds === 'string' 
              ? JSON.parse(firstPocketStaff.managedSantriIds) 
              : (Array.isArray(firstPocketStaff.managedSantriIds) ? firstPocketStaff.managedSantriIds : []);
            setSelectedSantriForMapping(initialIds);
          } catch (e) {
            setSelectedSantriForMapping([]);
          }
        }
      }
      if (permitsRes.data.success) setPermitsList(permitsRes.data.data);
    } catch (err) {
      console.error('Error loadData Academic:', err);
    } finally {
      setLoading(false);
    }
  };

  // Switch Selected Staff for Pocket Mapping
  const handleSelectStaffForMapping = (staff) => {
    setSelectedStaffForMapping(staff);
    try {
      const ids = typeof staff.managedSantriIds === 'string' 
        ? JSON.parse(staff.managedSantriIds) 
        : (Array.isArray(staff.managedSantriIds) ? staff.managedSantriIds : []);
      setSelectedSantriForMapping(ids);
    } catch (e) {
      setSelectedSantriForMapping([]);
    }
    setMappingSuccess(false);
  };

  const handleToggleSantriMapping = (santriId) => {
    setSelectedSantriForMapping(prev => 
      prev.includes(santriId) ? prev.filter(id => id !== santriId) : [...prev, santriId]
    );
    setMappingSuccess(false);
  };

  const handleSavePocketMapping = async () => {
    if (!selectedStaffForMapping) return;
    try {
      await updateUserAccount(selectedStaffForMapping.id, {
        managedSantriIds: selectedSantriForMapping,
      });
      setMappingSuccess(true);
      setTimeout(() => setMappingSuccess(false), 3000);
      loadData();
    } catch (err) {
      alert('Gagal menyimpan pemetaan santri');
    }
  };

  // Evaluasi Pengurus
  const handleOpenEvaluateStaff = (staff) => {
    setEvaluatingStaff(staff);
    setEvalNotes(staff.performanceNotes || '');
    setEvalGrade(staff.performanceGrade || 'Mumtaz');
    setEvalSuccess(false);
  };

  const handleSaveStaffEvaluation = async (e) => {
    e.preventDefault();
    if (!evaluatingStaff) return;
    try {
      await updateUserAccount(evaluatingStaff.id, {
        performanceNotes: evalNotes,
        performanceGrade: evalGrade,
      });
      setEvalSuccess(true);
      setTimeout(() => {
        setEvaluatingStaff(null);
        setEvalSuccess(false);
      }, 1500);
      loadData();
    } catch (err) {
      alert('Gagal menyimpan evaluasi pengurus');
    }
  };

  // Buat Akun Baru
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const res = await createUserAccount(accountFormData);
      if (res.data.success) {
        setIsAccountModalOpen(false);
        setAccountFormData({ username: '', password: '', name: '', role: 'PENGURUS_SAKU', division: 'ASRAMA_POS' });
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat akun');
    }
  };

  const handleOpenCreate = () => {
    setEditingRecord(null);
    setFormData({
      santriId: santriList[0]?.id?.toString() || '',
      type: 'MUHAFADZOH_QURAN',
      title: '',
      achievement: '',
      score: '95',
      grade: 'Mumtaz',
      notes: '',
      assessedBy: 'K.H. Syarif Hidayatullah, M.A. (Kepala Pondok)',
      date: new Date().toISOString().slice(0, 10),
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setFormData({
      santriId: rec.santriId.toString(),
      type: rec.type,
      title: rec.title,
      achievement: rec.achievement,
      score: rec.score !== null ? rec.score.toString() : '',
      grade: rec.grade || 'Mumtaz',
      notes: rec.notes || '',
      assessedBy: rec.assessedBy,
      date: new Date(rec.date).toISOString().slice(0, 10),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await updateAcademicRecord(editingRecord.id, formData);
      } else {
        await createAcademicRecord(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan catatan evaluasi');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Hapus catatan "${title}"?`)) {
      try {
        await deleteAcademicRecord(id);
        loadData();
      } catch (err) {
        alert('Gagal menghapus data');
      }
    }
  };

  const handleApprovePermit = async (permitId) => {
    try {
      await updatePermitStatus(permitId, { status: 'APPROVED' });
      loadData();
    } catch (err) {
      alert('Gagal menyetujui izin santri');
    }
  };

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Top Banner Overview Kepala Pondok */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Dashboard Devisi Kepala Pondok (Pengasuh)</h2>
          <p className="text-slate-500 mt-0.5">
            Pusat monitoring pengasuhan: muhafadzoh, pembuatan akun devisi, evaluasi pengurus, dan pemetaan uang saku santri.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Buat Akun Devisi</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Input Evaluasi Santri</span>
          </button>
        </div>
      </div>

      {/* 4 Metrik Monitoring Pengasuh */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Santri Asuh</span>
          <div className="text-xl font-black text-slate-900 mt-1">{santriList.length} Santri</div>
          <span className="text-[10px] text-emerald-600 font-bold">100% Terdaftar</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Santri Saldo Minus</span>
          <div className="text-xl font-black text-rose-600 mt-1">
            {santriList.filter(s => s.saldo_saku < 0).length} Santri
          </div>
          <span className="text-[10px] text-slate-400">Butuh perhatian / talangan</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Perizinan Aktif</span>
          <div className="text-xl font-black text-blue-700 mt-1">
            {permitsList.filter(p => p.status === 'ACTIVE' || p.status === 'APPROVED').length} Izin
          </div>
          <span className="text-[10px] text-slate-400">Dipantau real-time</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Pengurus Devisi</span>
          <div className="text-xl font-black text-slate-900 mt-1">{pengurusList.length} Akun</div>
          <span className="text-[10px] text-emerald-600 font-bold">Aktif Bertugas</span>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setSubTab('muhafadzoh')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            subTab === 'muhafadzoh' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Muhafadzoh & Evaluasi Santri</span>
        </button>

        <button
          onClick={() => setSubTab('pocket-map')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            subTab === 'pocket-map' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Pemetaan Uang Saku Santri</span>
        </button>

        <button
          onClick={() => setSubTab('pengurus')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            subTab === 'pengurus' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Akun Devisi & Evaluasi Kinerja</span>
        </button>

        <button
          onClick={() => setSubTab('permits')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            subTab === 'permits' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Persetujuan Izin Santri</span>
        </button>
      </div>

      {/* ======================================================================= */}
      {/* 1. SUB-TAB MUHAFADZOH & NILAI SANTRI                                    */}
      {/* ======================================================================= */}
      {subTab === 'muhafadzoh' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari santri, hafalan surah, kitab..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-700"
            >
              <option value="">Semua Kategori Evaluasi</option>
              {RECORD_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full py-12 text-center text-slate-400">Memuat catatan evaluasi...</div>
            ) : records.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400">Belum ada evaluasi muhafadzoh</div>
            ) : (
              records.map((rec) => (
                <div key={rec.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-300 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                        {RECORD_TYPES.find(t => t.id === rec.type)?.label || rec.type}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleOpenEdit(rec)} className="p-1 text-slate-400 hover:text-blue-600 rounded">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(rec.id, rec.title)} className="p-1 text-slate-400 hover:text-rose-600 rounded">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{rec.santri?.nama}</h4>
                      <div className="text-[11px] text-slate-400 font-mono">
                        NIS: {rec.santri?.nis} • {rec.santri?.kelas}
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-800">{rec.title}</div>
                      <div className="text-slate-600">{rec.achievement}</div>
                    </div>

                    {rec.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-amber-50/60 p-2 rounded-lg border border-amber-200/60">
                        "{rec.notes}"
                      </p>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Penguji: <strong className="text-slate-700">{rec.assessedBy}</strong></span>
                    {rec.score && (
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {rec.score} ({rec.grade})
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 2. SUB-TAB PEMETAAN UANG SAKU SANTRI KE PENGURUS ASUH                   */}
      {/* ======================================================================= */}
      {subTab === 'pocket-map' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Pemetaan Pengurus Uang Saku Santri Asuh</h3>
              <p className="text-slate-400 text-[11px]">
                Contoh: Ustadz Ridwan dipetakan untuk memegang uang saku Zaki, Farhan, dan Aisyah, maka di dashboard miliknya hanya muncul 3 santri tersebut.
              </p>
            </div>

            {mappingSuccess && (
              <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pemetaan Santri Berhasil Disimpan</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Kolom Kiri (4/12): Pilih Akun Pengurus */}
            <div className="lg:col-span-4 space-y-3">
              <span className="font-bold text-slate-800 block text-xs">1. Pilih Akun Pengurus Uang Saku:</span>
              <div className="space-y-2">
                {pengurusList.map((acc) => {
                  const isSelected = selectedStaffForMapping?.id === acc.id;
                  let count = 0;
                  try {
                    const parsed = typeof acc.managedSantriIds === 'string' ? JSON.parse(acc.managedSantriIds) : acc.managedSantriIds;
                    if (Array.isArray(parsed)) count = parsed.length;
                  } catch (e) {}

                  return (
                    <div
                      key={acc.id}
                      onClick={() => handleSelectStaffForMapping(acc)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500 shadow-sm'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{acc.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          {count} Santri Asuh
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Username: {acc.username} • Role: {acc.role}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kolom Kanan (8/12): Checklist Santri yang Diasuh */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">
                    2. Pilih Santri Binaan untuk: <strong className="text-blue-700">{selectedStaffForMapping?.name || 'Pilih Pengurus'}</strong>
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Centang santri yang uang sakunya dipegang oleh pengurus ini ({selectedSantriForMapping.length} santri terpilih)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSavePocketMapping}
                  disabled={!selectedStaffForMapping}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Pemetaan Santri</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {santriList.map((s) => {
                  const isChecked = selectedSantriForMapping.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleToggleSantriMapping(s.id)}
                      className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked ? 'bg-blue-50/60' : 'hover:bg-slate-50'
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
                            NIS: {s.nis} • {s.kelas} • {s.kamar}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`font-mono font-bold ${s.saldo_saku < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                          Rp {s.saldo_saku?.toLocaleString('id-ID')}
                        </div>
                        {isChecked && (
                          <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                            BINAAN PENGURUS
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3. SUB-TAB AKUN DEVISI & EVALUASI PENGURUS                              */}
      {/* ======================================================================= */}
      {subTab === 'pengurus' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Manajemen Akun Devisi & Evaluasi Kinerja Pengurus</h3>
              <p className="text-slate-400 text-[11px]">
                Kepala Pondok dapat membuat akun devisi baru dan memberikan evaluasi catatan kinerja kepada pengurus/asatidz.
              </p>
            </div>

            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
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
                  <th className="py-3.5 px-4">Devisi Tugas</th>
                  <th className="py-3.5 px-4">Predikat Kinerja</th>
                  <th className="py-3.5 px-4">Catatan Evaluasi Pengasuh</th>
                  <th className="py-3.5 px-4 text-center">Beri Evaluasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pengurusList.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{acc.name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{acc.username}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {acc.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        acc.performanceGrade === 'Mumtaz' ? 'bg-emerald-100 text-emerald-800' :
                        acc.performanceGrade === 'Jayyid Jiddan' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {acc.performanceGrade || 'Mumtaz'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {acc.performanceNotes || 'Belum ada catatan evaluasi'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenEvaluateStaff(acc)}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[10px] transition-colors"
                      >
                        Input Evaluasi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 4. SUB-TAB PERSETUJUAN IZIN SANTRI                                      */}
      {/* ======================================================================= */}
      {subTab === 'permits' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Persetujuan Surat Izin Keluar / Pulang Santri</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Santri</th>
                  <th className="py-3.5 px-4">Keperluan Izin</th>
                  <th className="py-3.5 px-4">Tujuan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Aksi Pengasuh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permitsList.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{p.santri?.nama}</td>
                    <td className="py-3.5 px-4 text-slate-700">{p.reason}</td>
                    <td className="py-3.5 px-4 text-slate-600">{p.destination || 'Dalam Kota'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'APPROVED' || p.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                        p.status === 'RETURNED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {p.status === 'PENDING' ? (
                        <button
                          onClick={() => handleApprovePermit(p.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                        >
                          ACC Izin
                        </button>
                      ) : (
                        <span className="text-slate-400 font-medium text-[11px]">Disetujui</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Input Evaluasi Kinerja Pengurus */}
      {evaluatingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Evaluasi Kinerja: {evaluatingStaff.name}</h3>
              <button onClick={() => setEvaluatingStaff(null)} className="text-white hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStaffEvaluation} className="p-5 space-y-4">
              {evalSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold">Evaluasi Kinerja Berhasil Disimpan</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Predikat Penilaian Kinerja</label>
                <select
                  value={evalGrade}
                  onChange={(e) => setEvalGrade(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-1 focus:ring-blue-600 font-bold"
                >
                  <option value="Mumtaz">Mumtaz (Sangat Baik / Istimewa)</option>
                  <option value="Jayyid Jiddan">Jayyid Jiddan (Baik Sekali)</option>
                  <option value="Jayyid">Jayyid (Baik / Cukup)</option>
                  <option value="Perlu Pembinaan">Perlu Pembinaan & Evaluasi</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan & Masukan Kepala Pondok</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan evaluasi kinerja, kedisiplinan, dan motivasi untuk pengurus..."
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEvaluatingStaff(null)}
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

      {/* Modal Input Muhafadzoh */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingRecord ? 'Edit Evaluasi Santri' : 'Input Evaluasi Muhafadzoh / Sikap Santri'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilih Santri *</label>
                  <select
                    required
                    value={formData.santriId}
                    onChange={(e) => setFormData({ ...formData, santriId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-1 focus:ring-blue-600 font-semibold"
                  >
                    {santriList.map((s) => (
                      <option key={s.id} value={s.id}>{s.nama} ({s.nis})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Evaluasi</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-1 focus:ring-blue-600"
                  >
                    {RECORD_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul / Materi Ujian *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Setoran Hafalan Surat Al-Kahfi"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Capaian & Hasil Evaluasi *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Juz 15 Ayat 1-50 (Lancar & Fasih)"
                  value={formData.achievement}
                  onChange={(e) => setFormData({ ...formData, achievement: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nilai Angka (Opsional)</label>
                  <input
                    type="number"
                    placeholder="95"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Predikat</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="Mumtaz">Mumtaz (A+)</option>
                    <option value="Jayyid Jiddan">Jayyid Jiddan (A)</option>
                    <option value="Jayyid">Jayyid (B)</option>
                    <option value="Maqbul">Maqbul (C)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan & Masukan Pengasuh (Tampil di Portal Wali)</label>
                <textarea
                  rows={3}
                  placeholder="Catatan motivasi untuk santri dan wali..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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

    </div>
  );
}
