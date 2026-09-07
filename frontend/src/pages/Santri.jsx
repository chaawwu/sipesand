import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Radio, 
  Wallet, 
  Eye, 
  X, 
  Check, 
  Phone, 
  Home, 
  GraduationCap,
  CreditCard,
  Printer,
  Download,
  Database,
  MapPin
} from 'lucide-react';
import { 
  getSantriList, 
  getSantriById, 
  createSantri, 
  updateSantri, 
  deleteSantri,
  exportSantriData 
} from '../services/api';
import SantriIdCard from '../components/SantriIdCard';
import FirebaseMigratorModal from '../components/FirebaseMigratorModal';
import AestheticToast from '../components/AestheticToast';

export default function Santri({ onOpenNfcModal }) {
  const [santriList, setSantriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Toast state
  const [toast, setToast] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [selectedSantri, setSelectedSantri] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form inputs
  const [formData, setFormData] = useState({
    nis: '',
    nfcUid: '',
    nama: '',
    gender: 'L',
    kelas: '',
    kamar: '',
    alamat: '',
    namaWali: '',
    noHpWali: '',
    saldo_saku: 0,
    status: 'AKTIF',
  });

  useEffect(() => {
    fetchSantri();
  }, [search, statusFilter]);

  const fetchSantri = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await getSantriList(params);
      if (res.data.success) {
        setSantriList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetchSantri:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedSantri(null);
    setFormData({
      nis: `2026${Math.floor(10000 + Math.random() * 90000)}`,
      nfcUid: `NFC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      nama: '',
      gender: 'L',
      kelas: '10 IPA (KMI 4)',
      kamar: 'Asrama Umar bin Khattab',
      alamat: 'Kompleks Pesantren Terpadu',
      namaWali: '',
      noHpWali: '',
      saldo_saku: 50000,
      status: 'AKTIF',
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (santri) => {
    setIsEditing(true);
    setSelectedSantri(santri);
    setFormData({
      nis: santri.nis || '',
      nfcUid: santri.nfcUid || '',
      nama: santri.nama || '',
      gender: santri.gender || 'L',
      kelas: santri.kelas || '',
      kamar: santri.kamar || '',
      alamat: santri.alamat || '',
      namaWali: santri.namaWali || '',
      noHpWali: santri.noHpWali || '',
      saldo_saku: santri.saldo_saku || 0,
      status: santri.status || 'AKTIF',
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenDetail = async (id) => {
    try {
      const res = await getSantriById(id);
      if (res.data.success) {
        setSelectedSantri(res.data.data);
        setIsDetailOpen(true);
      }
    } catch (err) {
      console.error('Error getSantriDetail:', err);
    }
  };

  const handleOpenIdCard = (santri) => {
    setSelectedSantri(santri);
    setIsIdCardOpen(true);
  };

  const handleExportData = async () => {
    try {
      const res = await exportSantriData();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `sipesand_santri_export_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setToast({
        isOpen: true,
        type: 'success',
        title: 'Export Data Berhasil',
        message: 'File JSON database santri berhasil diunduh.'
      });
    } catch (err) {
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Gagal Ekspor Data',
        message: 'Terjadi kesalahan saat mengunduh database santri.'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama) {
      setFormError('Nama santri wajib diisi');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      if (isEditing && selectedSantri) {
        await updateSantri(selectedSantri.id, formData);
        setToast({
          isOpen: true,
          type: 'success',
          title: 'Data Santri Diperbarui',
          message: `Profil santri ${formData.nama} berhasil diperbarui.`
        });
      } else {
        await createSantri(formData);
        setToast({
          isOpen: true,
          type: 'success',
          title: 'Santri Baru Ditambahkan',
          message: `Santri ${formData.nama} berhasil terdaftar di sistem.`
        });
      }
      setIsFormOpen(false);
      fetchSantri();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan data santri');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    try {
      await deleteSantri(id);
      setToast({
        isOpen: true,
        type: 'success',
        title: 'Santri Dihapus',
        message: `Data santri ${nama} berhasil dihapus.`
      });
      fetchSantri();
    } catch (err) {
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Gagal Menghapus',
        message: err.response?.data?.message || 'Gagal menghapus santri.'
      });
    }
  };

  return (
    <div className="space-y-6 text-xs">
      
      {/* Top Filter & Actions Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, NIS, NFC UID, kamar, alamat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700"
          >
            <option value="">Semua Status</option>
            <option value="AKTIF">Status: Aktif</option>
            <option value="NONAKTIF">Status: Nonaktif</option>
            <option value="ALUMNI">Status: Alumni</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsFirebaseModalOpen(true)}
            className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Database className="w-4 h-4" />
            <span>Import Firebase</span>
          </button>

          <button
            onClick={handleExportData}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors flex items-center gap-1.5 border border-slate-300"
          >
            <Download className="w-4 h-4" />
            <span>Export ID Data</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Santri</span>
          </button>
        </div>
      </div>

      {/* Santri Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Santri</th>
                <th className="py-3.5 px-4">Kelas & Kamar</th>
                <th className="py-3.5 px-4">Alamat Domisili</th>
                <th className="py-3.5 px-4">Kartu Smart NFC</th>
                <th className="py-3.5 px-4">Saldo Saku</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi & ID Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Memuat data santri...
                  </td>
                </tr>
              ) : santriList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada santri ditemukan
                  </td>
                </tr>
              ) : (
                santriList.map((santri) => (
                  <tr key={santri.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Santri Name & NIS */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                          {santri.nama.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{santri.nama}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            NIS: {santri.nis || '-'} • {santri.gender === 'L' ? 'Ikhwan' : 'Akhwat'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Kelas & Kamar */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="font-medium text-slate-800">{santri.kelas || '-'}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[160px]">{santri.kamar || '-'}</div>
                    </td>

                    {/* Alamat */}
                    <td className="py-3.5 px-4 text-slate-600 truncate max-w-[180px]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{santri.alamat || 'Sleman, Yogyakarta'}</span>
                      </div>
                    </td>

                    {/* NFC UID */}
                    <td className="py-3.5 px-4">
                      {santri.nfcUid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          <Radio className="w-3 h-3 text-blue-600" />
                          <span>{santri.nfcUid}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Belum terdaftar</span>
                      )}
                    </td>

                    {/* Saldo Saku */}
                    <td className="py-3.5 px-4">
                      <div className={`font-bold font-mono ${santri.saldo_saku < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        Rp {santri.saldo_saku.toLocaleString('id-ID')}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          santri.status === 'AKTIF'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {santri.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Tombol Cetak KTSD / ID Card ATM */}
                        <button
                          onClick={() => handleOpenIdCard(santri)}
                          className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-[11px] font-bold shadow-sm transition-all flex items-center gap-1"
                          title="Cetak Kartu Tanda Santri (ID Card ATM)"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Cetak KTSD</span>
                        </button>

                        <button
                          onClick={() => handleOpenDetail(santri.id)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat Detail & Mutasi"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(santri)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Data"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(santri.id, santri.nama)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Create/Edit */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
            <div className="bg-blue-700 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {isEditing ? 'Edit Data Santri' : 'Tambah Santri Baru'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-white hover:opacity-80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Santri *</label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Muhammad Azzam"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="L">Laki-laki (Ikhwan)</option>
                    <option value="P">Perempuan (Akhwat)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIS (Nomor Induk)</label>
                  <input
                    type="text"
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500"
                    placeholder="202601009"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NFC Card UID</label>
                  <input
                    type="text"
                    value={formData.nfcUid}
                    onChange={(e) => setFormData({ ...formData, nfcUid: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500"
                    placeholder="NFC-99A1BC"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas / Tingkat</label>
                  <input
                    type="text"
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="10 IPA 1 (KMI 4)"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kamar / Asrama</label>
                  <input
                    type="text"
                    value={formData.kamar}
                    onChange={(e) => setFormData({ ...formData, kamar: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Asrama Umar Kamar 05"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Asal Santri</label>
                <input
                  type="text"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="Jl. Slamet Riyadi No. 102, Surakarta"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={formData.namaWali}
                    onChange={(e) => setFormData({ ...formData, namaWali: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. WhatsApp Wali</label>
                  <input
                    type="text"
                    value={formData.noHpWali}
                    onChange={(e) => setFormData({ ...formData, noHpWali: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="081234567890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Saldo Awal Uang Saku (Rp)</label>
                  <input
                    type="number"
                    value={formData.saldo_saku}
                    onChange={(e) => setFormData({ ...formData, saldo_saku: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Keaktifan</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="NONAKTIF">NONAKTIF</option>
                    <option value="ALUMNI">ALUMNI</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : isEditing ? 'Perbarui Data' : 'Simpan Santri'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cetak ID Card ATM */}
      <SantriIdCard
        santri={selectedSantri}
        isOpen={isIdCardOpen}
        onClose={() => setIsIdCardOpen(false)}
      />

      {/* Modal Transmigrasi Firebase */}
      <FirebaseMigratorModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        onSuccess={fetchSantri}
      />

      {/* Aesthetic Toast Notification */}
      <AestheticToast
        isOpen={toast.isOpen}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
}
