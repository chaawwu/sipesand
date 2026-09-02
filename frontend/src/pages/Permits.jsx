import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  Radio, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  X,
  Calendar,
  LogOut,
  LogIn
} from 'lucide-react';
import { getPermits, createPermit, updatePermitStatus, getSantriList } from '../services/api';

export default function Permits({ onOpenNfcModal }) {
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [santriList, setSantriList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    santriId: '',
    type: 'HARIAN',
    reason: '',
    destination: '',
    departureTime: '',
    returnTime: '',
    approvedBy: 'Ustadz Pengasuhan Santri',
    notes: '',
  });

  useEffect(() => {
    fetchPermits();
    fetchSantriOptions();
  }, [statusFilter]);

  const fetchPermits = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await getPermits(params);
      if (res.data.success) {
        setPermits(res.data.data);
      }
    } catch (err) {
      console.error('Error fetchPermits:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSantriOptions = async () => {
    try {
      const res = await getSantriList();
      if (res.data.success) {
        setSantriList(res.data.data);
        if (res.data.data.length > 0 && !formData.santriId) {
          setFormData((prev) => ({ ...prev, santriId: res.data.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Error fetchSantriOptions:', err);
    }
  };

  const handleOpenCreate = () => {
    const now = new Date();
    const later = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 jam kemudian
    
    // Format to datetime-local string
    const formatDt = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setFormData({
      santriId: santriList[0]?.id || '',
      type: 'HARIAN',
      reason: '',
      destination: '',
      departureTime: formatDt(now),
      returnTime: formatDt(later),
      approvedBy: 'Ustadz Pengasuhan',
      notes: '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.santriId) {
      setErrorMsg('Pilih santri terlebih dahulu');
      return;
    }
    if (!formData.reason) {
      setErrorMsg('Alasan izin wajib diisi');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await createPermit({
        ...formData,
        status: 'APPROVED', // Langsung approved jika dibuat oleh pengurus
      });
      setIsModalOpen(false);
      fetchPermits();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal membuat surat izin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updatePermitStatus(id, { status: newStatus });
      fetchPermits();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status izin');
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium"
          >
            <option value="">Semua Status Izin</option>
            <option value="PENDING">Menunggu Persetujuan (PENDING)</option>
            <option value="APPROVED">Disetujui (APPROVED)</option>
            <option value="ACTIVE">Sedang Berada di Luar (ACTIVE)</option>
            <option value="RETURNED">Sudah Kembali (RETURNED)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNfcModal}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-all"
          >
            <Radio className="w-4 h-4 text-emerald-600" />
            <span>Scan Tap NFC Check-in</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Surat Izin Baru</span>
          </button>
        </div>
      </div>

      {/* Tabel Perizinan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">No. Surat & Santri</th>
                <th className="py-3.5 px-4">Jenis & Alasan</th>
                <th className="py-3.5 px-4">Waktu Keluar - Batas Kembali</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Memuat data perizinan...
                  </td>
                </tr>
              ) : permits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Belum ada surat izin tercatat
                  </td>
                </tr>
              ) : (
                permits.map((permit) => {
                  const isLate = permit.currentStatus === 'OVERDUE' || (permit.status === 'ACTIVE' && new Date(permit.returnTime) < new Date());
                  return (
                    <tr key={permit.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-800">{permit.permitCode}</div>
                        <div className="font-bold text-emerald-800 mt-0.5">{permit.santri?.nama}</div>
                        <div className="text-[11px] text-slate-400">{permit.santri?.kamar || permit.santri?.kelas}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 mb-1">
                          {permit.type}
                        </span>
                        <div className="font-semibold text-slate-800">{permit.reason}</div>
                        <div className="text-[11px] text-slate-500">Tujuan: {permit.destination || '-'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <LogOut className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(permit.departureTime).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1.5 mt-1 font-semibold ${isLate ? 'text-rose-600' : 'text-slate-600'}`}>
                          <LogIn className="w-3.5 h-3.5" />
                          <span>
                            Batas: {new Date(permit.returnTime).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {isLate ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            <span>TERLAMBAT</span>
                          </span>
                        ) : (
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              permit.status === 'RETURNED'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : permit.status === 'ACTIVE'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : permit.status === 'APPROVED'
                                ? 'bg-teal-100 text-teal-800 border border-teal-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {permit.status}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {permit.status === 'PENDING' && (
                            <button
                              onClick={() => handleUpdateStatus(permit.id, 'APPROVED')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                            >
                              Setujui
                            </button>
                          )}

                          {permit.status === 'APPROVED' && (
                            <button
                              onClick={() => handleUpdateStatus(permit.id, 'ACTIVE')}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                            >
                              <LogOut className="w-3 h-3" />
                              <span>Check-Out (Keluar)</span>
                            </button>
                          )}

                          {permit.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleUpdateStatus(permit.id, 'RETURNED')}
                              className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                            >
                              <LogIn className="w-3 h-3" />
                              <span>Check-In (Kembali)</span>
                            </button>
                          )}

                          {permit.status === 'RETURNED' && (
                            <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Selesai</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Buat Izin Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Buat Surat Izin Keluar Santri</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* Santri & Tipe Izin */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Santri *</label>
                <select
                  value={formData.santriId}
                  onChange={(e) => setFormData({ ...formData, santriId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  {santriList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.kelas || 'Santri'}) - {s.kamar || 'Asrama'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Izin</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="HARIAN">HARIAN (Keperluan Harian)</option>
                    <option value="BEROBAT">BEROBAT (Klinik / RS)</option>
                    <option value="PULANG">PULANG (Sambang Keluarga)</option>
                    <option value="LOMBA">LOMBA / DELEGASI</option>
                    <option value="DARURAT">DARURAT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lokasi Tujuan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Rumah Sakit PKU / Sleman"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alasan / Keperluan Izin *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemeriksaan mata ke dokter spesialis"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Jadwal Keberangkatan & Rencana Kembali */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Waktu Keberangkatan</label>
                  <input
                    type="datetime-local"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batas Waktu Kembali</label>
                  <input
                    type="datetime-local"
                    value={formData.returnTime}
                    onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Disetujui Oleh (Ustadz/Pengasuhan)</label>
                <input
                  type="text"
                  value={formData.approvedBy}
                  onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Terbitkan Izin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
