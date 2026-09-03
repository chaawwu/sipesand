import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  AlertTriangle, 
  X, 
  Trash2, 
  Edit, 
  Radio, 
  BookOpen,
  Calendar,
  UserCheck
} from 'lucide-react';
import { 
  getViolations, 
  createViolation, 
  updateViolationStatus, 
  deleteViolation,
  getPermits,
  createPermit,
  updatePermitStatus,
  getSantriList 
} from '../services/api';

export default function SecurityKamtib({ onOpenNfcModal }) {
  const [subTab, setSubTab] = useState('permits'); // 'permits' | 'violations' | 'rules'
  
  // Data States
  const [permits, setPermits] = useState([]);
  const [violations, setViolations] = useState([]);
  const [santriList, setSantriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal Permit State
  const [isPermitModalOpen, setIsPermitModalOpen] = useState(false);
  const [permitFormData, setPermitFormData] = useState({
    santriId: '',
    type: 'HARIAN',
    reason: '',
    destination: '',
    departureTime: new Date().toISOString().slice(0, 16),
    returnTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16),
    approvedBy: 'Divisi Keamanan (Kamtib)',
    notes: '',
  });

  // Modal Violation State
  const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
  const [violationFormData, setViolationFormData] = useState({
    santriId: '',
    violation: '',
    category: 'RINGAN',
    takziran: '',
    officer: 'Divisi Keamanan & Kamtib',
  });

  useEffect(() => {
    loadData();
  }, [subTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [permitsRes, violationsRes, santriRes] = await Promise.all([
        getPermits(),
        getViolations(),
        getSantriList(),
      ]);

      if (permitsRes?.data?.success && Array.isArray(permitsRes.data.data)) {
        setPermits(permitsRes.data.data);
      } else {
        setPermits([]);
      }

      if (violationsRes?.data?.success && Array.isArray(violationsRes.data.data)) {
        setViolations(violationsRes.data.data);
      } else {
        setViolations([]);
      }

      if (santriRes?.data?.success && Array.isArray(santriRes.data.data)) {
        setSantriList(santriRes.data.data);
        if (!permitFormData.santriId && santriRes.data.data.length > 0) {
          setPermitFormData(prev => ({ ...prev, santriId: santriRes.data.data[0].id.toString() }));
          setViolationFormData(prev => ({ ...prev, santriId: santriRes.data.data[0].id.toString() }));
        }
      } else {
        setSantriList([]);
      }
    } catch (err) {
      console.error('Error loadData Security:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePermit = async (e) => {
    e.preventDefault();
    try {
      await createPermit({
        ...permitFormData,
        santriId: parseInt(permitFormData.santriId),
        departureTime: new Date(permitFormData.departureTime),
        returnTime: new Date(permitFormData.returnTime),
      });
      setIsPermitModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menerbitkan surat izin');
    }
  };

  const handleUpdatePermit = async (id, status) => {
    try {
      await updatePermitStatus(id, { status });
      loadData();
    } catch (err) {
      alert('Gagal memperbarui status izin');
    }
  };

  const handleCreateViolation = async (e) => {
    e.preventDefault();
    try {
      await createViolation(violationFormData);
      setIsViolationModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mencatat pelanggaran');
    }
  };

  const handleUpdateViolationStatus = async (id, status) => {
    try {
      await updateViolationStatus(id, { status });
      loadData();
    } catch (err) {
      alert('Gagal memperbarui status takziran');
    }
  };

  const handleDeleteViolation = async (id) => {
    if (window.confirm('Hapus catatan pelanggaran ini?')) {
      try {
        await deleteViolation(id);
        loadData();
      } catch (err) {
        alert('Gagal menghapus catatan');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Sub-tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('permits')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              subTab === 'permits' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Perizinan Keluar / Pulang</span>
          </button>

          <button
            onClick={() => setSubTab('violations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              subTab === 'violations' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Pelanggaran & Takziran</span>
          </button>

          <button
            onClick={() => setSubTab('rules')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              subTab === 'rules' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Tata Tertib Pesantren</span>
          </button>
        </div>

        <div>
          {subTab === 'permits' ? (
            <button
              onClick={() => setIsPermitModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Izin Keluar/Pulang</span>
            </button>
          ) : subTab === 'violations' ? (
            <button
              onClick={() => setIsViolationModalOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Pelanggaran & Takziran</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 1. SUB-TAB PERIZINAN KELUAR / PULANG                                    */}
      {/* ======================================================================= */}
      {subTab === 'permits' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Daftar Perizinan Santri & Deteksi Overdue</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Santri</th>
                  <th className="py-3.5 px-4">Jenis & Keperluan</th>
                  <th className="py-3.5 px-4">Tujuan</th>
                  <th className="py-3.5 px-4">Jadwal Keluar - Kembali</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Aksi Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">Memuat data perizinan...</td>
                  </tr>
                ) : permits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">Belum ada data perizinan</td>
                  </tr>
                ) : (
                  permits.map((p) => {
                    const now = new Date();
                    const isLate = p.status === 'ACTIVE' && new Date(p.returnTime) < now;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{p.santri?.nama}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            NIS: {p.santri?.nis} • {p.santri?.kelas}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                            {p.type}
                          </span>
                          <div className="font-medium text-slate-800 mt-1">{p.reason}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{p.destination || 'Dalam Kota'}</td>
                        <td className="py-3.5 px-4 text-slate-500">
                          <div>Keluar: {new Date(p.departureTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                          <div className={isLate ? 'text-rose-600 font-bold' : ''}>
                            Kembali: {new Date(p.returnTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isLate || p.status === 'OVERDUE'
                              ? 'bg-rose-100 text-rose-700'
                              : p.status === 'RETURNED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {isLate ? 'OVERDUE (TERLAMBAT)' : p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {p.status === 'ACTIVE' || isLate ? (
                            <button
                              onClick={() => handleUpdatePermit(p.id, 'RETURNED')}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition-colors"
                            >
                              Check-In Kembali
                            </button>
                          ) : p.status === 'PENDING' ? (
                            <button
                              onClick={() => handleUpdatePermit(p.id, 'APPROVED')}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition-colors"
                            >
                              ACC Izin
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-semibold">Sudah kembali</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 2. SUB-TAB PELANGGARAN & TAKZIRAN                                       */}
      {/* ======================================================================= */}
      {subTab === 'violations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Catatan Pelanggaran Tata Tertib & Sanksi Takziran Edukatif</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Santri</th>
                  <th className="py-3.5 px-4">Bentuk Pelanggaran</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Sanksi Takziran Edukatif</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Aksi Kamtib</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {violations.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{v.santri?.nama}</div>
                      <div className="text-[10px] text-slate-400 font-mono">NIS: {v.santri?.nis}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{v.violation}</div>
                      <div className="text-[10px] text-slate-400">{new Date(v.date).toLocaleDateString('id-ID')} • {v.officer}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        v.category === 'BERAT' ? 'bg-rose-100 text-rose-800' : v.category === 'SEDANG' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {v.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-amber-900 bg-amber-50/50">
                      {v.takziran}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        v.status === 'SELESAI' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {v.status === 'PROSES' && (
                          <button
                            onClick={() => handleUpdateViolationStatus(v.id, 'SELESAI')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition-colors"
                          >
                            Tandai Selesai
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteViolation(v.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3. SUB-TAB TATA TERTIB PESANTREN                                        */}
      {/* ======================================================================= */}
      {subTab === 'rules' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">
            Pedoman Tata Tertib & Kedisiplinan Pondok Pesantren
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
              <h4 className="font-bold text-blue-900 text-xs">1. Kedisiplinan Ibadah</h4>
              <p className="text-blue-950/80 leading-relaxed text-[11px]">
                Wajib mengikuti sholat lima waktu berjamaah di masjid tepat waktu. Santri yang masbuk 3x berturut-turut akan diberikan bimbingan muhafadzoh adab.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <h4 className="font-bold text-emerald-900 text-xs">2. Perizinan Keluar</h4>
              <p className="text-emerald-950/80 leading-relaxed text-[11px]">
                Keluar lingkungan pondok wajib membawa kartu Smart NFC dan surat izin resmi dari Kamtib. Keterlambatan tercatat otomatis sebagai status Overdue.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <h4 className="font-bold text-amber-900 text-xs">3. Sanksi & Takziran Edukatif</h4>
              <p className="text-amber-950/80 leading-relaxed text-[11px]">
                Semua takziran bersifat mendidik (ziyadah hafalan Al-Qur'an, mufrodat bahasa Arab/Inggris, atau piket kebersihan asrama).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Izin */}
      {isPermitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 text-xs">
            <div className="bg-blue-700 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Terbitkan Surat Izin Santri</h3>
              <button onClick={() => setIsPermitModalOpen(false)} className="text-white hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePermit} className="p-5 space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Santri *</label>
                <select
                  required
                  value={permitFormData.santriId}
                  onChange={(e) => setPermitFormData({ ...permitFormData, santriId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  {santriList.map((s) => (
                    <option key={s.id} value={s.id}>{s.nama} ({s.nis})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Perizinan</label>
                <select
                  value={permitFormData.type}
                  onChange={(e) => setPermitFormData({ ...permitFormData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="HARIAN">Izin Harian (Beli Kitab / Kebutuhan)</option>
                  <option value="PULANG">Izin Pulang / Sambang Wali</option>
                  <option value="BEROBAT">Izin Berobat ke Klinik / RS</option>
                  <option value="LOMBA">Delegasi Lomba / Acara Luar</option>
                  <option value="DARURAT">Izin Darurat</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alasan / Keperluan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemeriksaan dokter gigi"
                  value={permitFormData.reason}
                  onChange={(e) => setPermitFormData({ ...permitFormData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tujuan</label>
                <input
                  type="text"
                  placeholder="Contoh: RS PKU Muhammadiyah"
                  value={permitFormData.destination}
                  onChange={(e) => setPermitFormData({ ...permitFormData, destination: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Waktu Keluar</label>
                  <input
                    type="datetime-local"
                    value={permitFormData.departureTime}
                    onChange={(e) => setPermitFormData({ ...permitFormData, departureTime: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batas Kembali</label>
                  <input
                    type="datetime-local"
                    value={permitFormData.returnTime}
                    onChange={(e) => setPermitFormData({ ...permitFormData, returnTime: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPermitModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
                >
                  Terbitkan Izin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Catat Pelanggaran */}
      {isViolationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 text-xs">
            <div className="bg-rose-700 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Catat Pelanggaran & Takziran Santri</h3>
              <button onClick={() => setIsViolationModalOpen(false)} className="text-white hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateViolation} className="p-5 space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Santri *</label>
                <select
                  required
                  value={violationFormData.santriId}
                  onChange={(e) => setViolationFormData({ ...violationFormData, santriId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-rose-500 font-semibold"
                >
                  {santriList.map((s) => (
                    <option key={s.id} value={s.id}>{s.nama} ({s.nis})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bentuk Pelanggaran *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Terlambat sholat maghrib berjamaah"
                  value={violationFormData.violation}
                  onChange={(e) => setViolationFormData({ ...violationFormData, violation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tingkat Kategori</label>
                <select
                  value={violationFormData.category}
                  onChange={(e) => setViolationFormData({ ...violationFormData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-rose-500"
                >
                  <option value="RINGAN">Ringan</option>
                  <option value="SEDANG">Sedang</option>
                  <option value="BERAT">Berat</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bentuk Sanksi Takziran Edukatif *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Membaca mufrodat di depan asrama / Piket masjid"
                  value={violationFormData.takziran}
                  onChange={(e) => setViolationFormData({ ...violationFormData, takziran: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsViolationModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
