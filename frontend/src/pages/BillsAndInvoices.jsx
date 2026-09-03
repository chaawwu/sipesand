import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  CheckSquare, 
  Square, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit, 
  Printer, 
  DollarSign, 
  MessageSquare, 
  Send, 
  Calendar,
  ExternalLink,
  X
} from 'lucide-react';
import { 
  getMasterBills, 
  createMasterBill, 
  updateMasterBill, 
  deleteMasterBill,
  getSantriBills, 
  generateMassBills, 
  autoGenerateHijriBills,
  updateSantriBill, 
  deleteSantriBill,
  getSantriList 
} from '../services/api';
import OfficialReceipt from '../components/OfficialReceipt';
import AestheticToast from '../components/AestheticToast';

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi\'ul Awwal', 'Rabi\'ul Akhir', 
  'Jumadil Ula', 'Jumadil Akhirah', 'Rajab', 'Sya\'ban', 
  'Ramadhan', 'Syawwal', 'Dzulqa\'dah', 'Dzulhijjah'
];

export default function BillsAndInvoices() {
  const [activeSubTab, setActiveSubTab] = useState('mass'); // 'mass' | 'master' | 'receipts'
  
  // Data States
  const [masterBills, setMasterBills] = useState([]);
  const [santriBills, setSantriBills] = useState([]);
  const [santriList, setSantriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');

  // Mass Bill Generator State
  const [selectedSantriIds, setSelectedSantriIds] = useState([]);
  const [selectedMasterBillId, setSelectedMasterBillId] = useState('');
  const [selectedHijriMonth, setSelectedHijriMonth] = useState('Ramadhan');
  const [selectedHijriYear, setSelectedHijriYear] = useState('1447 H');
  const [customBillTitle, setCustomBillTitle] = useState('');
  const [customBillAmount, setCustomBillAmount] = useState('');
  const [generating, setGenerating] = useState(false);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState(null);

  // Aesthetic Toast State
  const [toast, setToast] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Master Bill Modal State
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [editingMaster, setEditingMaster] = useState(null);
  const [masterFormData, setMasterFormData] = useState({
    name: '',
    amount: '',
    type: 'BULANAN_HIJRIYAH',
    description: '',
  });

  // Receipt Modal State
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [activeReceiptData, setActiveReceiptData] = useState(null);

  useEffect(() => {
    loadAllData();
  }, [statusFilter, monthFilter, search]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (monthFilter) params.hijriMonth = monthFilter;
      if (search) params.search = search;

      const [masterRes, billsRes, santriRes] = await Promise.all([
        getMasterBills(),
        getSantriBills(params),
        getSantriList(),
      ]);

      if (masterRes?.data?.success && Array.isArray(masterRes.data.data)) {
        setMasterBills(masterRes.data.data);
        if (!selectedMasterBillId && masterRes.data.data.length > 0) {
          setSelectedMasterBillId(masterRes.data.data[0].id.toString());
        }
      } else {
        setMasterBills([]);
      }
      if (billsRes?.data?.success && Array.isArray(billsRes.data.data)) {
        setSantriBills(billsRes.data.data);
      } else {
        setSantriBills([]);
      }
      if (santriRes?.data?.success && Array.isArray(santriRes.data.data)) {
        setSantriList(santriRes.data.data);
      } else {
        setSantriList([]);
      }
    } catch (err) {
      console.error('Error loadAllData:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAllSantri = () => {
    if (selectedSantriIds.length === santriList.length) {
      setSelectedSantriIds([]);
    } else {
      setSelectedSantriIds(santriList.map((s) => s.id));
    }
  };

  const handleToggleSantri = (id) => {
    setSelectedSantriIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleGenerateMass = async (e) => {
    e.preventDefault();
    if (selectedSantriIds.length === 0) {
      setToast({
        isOpen: true,
        type: 'warning',
        title: 'Pilih Santri',
        message: 'Silakan pilih minimal 1 santri untuk dibuatkan tagihan massal.'
      });
      return;
    }

    try {
      setGenerating(true);
      setGenMessage(null);

      const payload = {
        santriIds: selectedSantriIds,
        masterBillId: selectedMasterBillId ? parseInt(selectedMasterBillId) : null,
        hijriMonth: selectedHijriMonth,
        hijriYear: selectedHijriYear,
        customTitle: customBillTitle || undefined,
        customAmount: customBillAmount || undefined,
      };

      const res = await generateMassBills(payload);
      if (res.data.success) {
        setToast({
          isOpen: true,
          type: 'success',
          title: 'Tagihan Massal Diterbitkan',
          message: res.data.message || `Berhasil menerbitkan tagihan untuk ${selectedSantriIds.length} santri.`
        });
        setSelectedSantriIds([]);
        loadAllData();
      }
    } catch (err) {
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Gagal Menerbitkan Tagihan',
        message: err.response?.data?.message || 'Terjadi kesalahan saat generate tagihan massal.'
      });
    } finally {
      setGenerating(false);
    }
  };

  // Handler Auto-Generate 1 Hijriyah
  const handleAutoGenerateHijri = async () => {
    try {
      setAutoGenerating(true);
      const res = await autoGenerateHijriBills({});
      if (res.data.success) {
        setToast({
          isOpen: true,
          type: 'success',
          title: 'Auto-Tagihan 1 Hijriyah Berhasil',
          message: res.data.message || `Diterbitkan untuk ${res.data.generatedCount} santri.`
        });
        loadAllData();
      }
    } catch (err) {
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Gagal Auto-Tagihan',
        message: err.response?.data?.message || 'Gagal menjalankan auto-tagihan Hijriyah.'
      });
    } finally {
      setAutoGenerating(false);
    }
  };

  // Follow up WhatsApp Wali Otomatis
  const handleSendWaBillFollowup = (bill) => {
    const santri = bill.santri;
    if (!santri?.noHpWali) {
      setToast({
        isOpen: true,
        type: 'warning',
        title: 'No. WhatsApp Belum Ada',
        message: `Nomor WhatsApp wali untuk ${santri?.nama || 'santri ini'} belum terdaftar di database.`
      });
      return;
    }

    let phone = santri.noHpWali.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.slice(1);
    }

    const message = `Assalamu'alaikum Wr. Wb. Bapak/Ibu Wali dari Ananda *${santri.nama}* (NIS: ${santri.nis || '-'}).\n\nKami dari Bendahara Pondok Pesantren Terpadu SiPesand menginformasikan tagihan pembayaran:\n- Pos Tagihan: *${bill.title}*\n- Periode: *${bill.hijriMonth || '-'} ${bill.hijriYear || ''}*\n- Total Nominal: *Rp ${bill.amount.toLocaleString('id-ID')}*\n- Status: *BELUM LUNAS*\n\nBapak/Ibu dapat melakukan pembayaran transfer via BSI atau QRIS resmi dan mengunggah bukti langsung melalui Portal Wali di website SiPesand.\n\nTerima kasih atas kerja samanya. Jazakumullah Khairan Katsiran.\n_Bendahara Pesantren SiPesand_`;

    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleOpenCreateMaster = () => {
    setEditingMaster(null);
    setMasterFormData({ name: '', amount: '', type: 'BULANAN_HIJRIYAH', description: '' });
    setIsMasterModalOpen(true);
  };

  const handleOpenEditMaster = (mb) => {
    setEditingMaster(mb);
    setMasterFormData({
      name: mb.name,
      amount: mb.amount,
      type: mb.type,
      description: mb.description || '',
    });
    setIsMasterModalOpen(true);
  };

  const handleSaveMaster = async (e) => {
    e.preventDefault();
    try {
      if (editingMaster) {
        await updateMasterBill(editingMaster.id, masterFormData);
        setToast({
          isOpen: true,
          type: 'success',
          title: 'Master Tagihan Diperbarui',
          message: `Tarif master "${masterFormData.name}" berhasil disimpan.`
        });
      } else {
        await createMasterBill(masterFormData);
        setToast({
          isOpen: true,
          type: 'success',
          title: 'Master Tagihan Dibuat',
          message: `Pos master tagihan "${masterFormData.name}" berhasil ditambahkan.`
        });
      }
      setIsMasterModalOpen(false);
      loadAllData();
    } catch (err) {
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Gagal Menyimpan Master Tagihan',
        message: err.response?.data?.message || 'Terjadi kesalahan sistem.'
      });
    }
  };

  const handleDeleteMaster = async (id, name) => {
    try {
      await deleteMasterBill(id);
      setToast({
        isOpen: true,
        type: 'success',
        title: 'Master Tagihan Dihapus',
        message: `Pos tagihan "${name}" telah dihapus dari sistem.`
      });
      loadAllData();
    } catch (err) {
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Gagal Menghapus',
        message: 'Master tagihan tidak dapat dihapus karena masih terkait data santri.'
      });
    }
  };

  const handleDeleteSantriBill = async (id, title) => {
    try {
      await deleteSantriBill(id);
      setToast({
        isOpen: true,
        type: 'success',
        title: 'Tagihan Dihapus',
        message: `Tagihan "${title}" berhasil dihapus.`
      });
      loadAllData();
    } catch (err) {
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Gagal Menghapus',
        message: 'Gagal menghapus tagihan santri.'
      });
    }
  };

  const handleOpenPrintReceipt = (bill) => {
    setActiveReceiptData({
      code: bill.receiptNumber || `KWT-${bill.billCode}`,
      date: bill.paymentDate || bill.updatedAt,
      santriName: bill.santri?.nama,
      waliName: bill.santri?.namaWali || 'Wali Santri',
      nis: bill.santri?.nis,
      kelas: bill.santri?.kelas,
      items: [
        { id: bill.id, name: bill.title, amount: bill.amount }
      ]
    });
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('mass')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'mass' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tagihan Massal Hijriyah</span>
          </button>

          <button
            onClick={() => setActiveSubTab('master')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'master' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Master Tarif Tagihan</span>
          </button>

          <button
            onClick={() => setActiveSubTab('receipts')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'receipts' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Riwayat Kwitansi Sah</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Auto-Generate Tagihan 1 Hijriyah */}
          {activeSubTab === 'mass' && (
            <button
              onClick={handleAutoGenerateHijri}
              disabled={autoGenerating}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-subtle transition-all flex items-center gap-1.5 disabled:opacity-50 text-xs"
              title="Terbitkan Otomatis Tagihan Syahriyah 1 Hijriyah untuk semua santri aktif yang belum memiliki tagihan bulan ini"
            >
              <Calendar className="w-4 h-4 text-emerald-100" />
              <span>{autoGenerating ? 'Menerbitkan...' : 'Auto-Tagihan 1 Hijriyah'}</span>
            </button>
          )}

          {activeSubTab === 'master' && (
            <button
              onClick={handleOpenCreateMaster}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Master Tagihan</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 1. SUB-TAB TAGIHAN MASSAL HIJRIYAH                                      */}
      {/* ======================================================================= */}
      {activeSubTab === 'mass' && (
        <div className="space-y-6">
          
          {/* Card Generator Massal */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Generator Tagihan Massal Santri</h3>
                <p className="text-slate-500 mt-0.5">Pilih santri dan tentukan bulan kalender Hijriyah</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Santri Terpilih: </span>
                <span className="font-bold text-blue-700 font-mono text-sm">{selectedSantriIds.length} / {santriList.length}</span>
              </div>
            </div>

            <form onSubmit={handleGenerateMass} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Master Tagihan</label>
                <select
                  value={selectedMasterBillId}
                  onChange={(e) => setSelectedMasterBillId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-1 focus:ring-blue-600 font-medium"
                >
                  {masterBills.map((mb) => (
                    <option key={mb.id} value={mb.id}>
                      {mb.name} (Rp {mb.amount.toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bulan Hijriyah</label>
                <select
                  value={selectedHijriMonth}
                  onChange={(e) => setSelectedHijriMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-1 focus:ring-blue-600 font-medium"
                >
                  {HIJRI_MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tahun Hijriyah</label>
                <input
                  type="text"
                  value={selectedHijriYear}
                  onChange={(e) => setSelectedHijriYear(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-1 focus:ring-blue-600 font-mono"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={generating || selectedSantriIds.length === 0}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {generating ? 'Menerbitkan...' : `Generate ke ${selectedSantriIds.length} Santri`}
                </button>
              </div>
            </form>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleSelectAllSantri}
                className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1.5"
              >
                {selectedSantriIds.length === santriList.length ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>Batalkan Pilih Semua</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Pilih Semua Santri ({santriList.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Filter Tagihan Santri */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama santri, pos tagihan, kode..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700"
              >
                <option value="">Semua Status</option>
                <option value="UNPAID">Belum Lunas</option>
                <option value="PENDING_VERIFICATION">Menunggu Verifikasi (ACC)</option>
                <option value="PAID">Lunas</option>
              </select>

              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700"
              >
                <option value="">Semua Bulan Hijriyah</option>
                {HIJRI_MONTHS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabel Tagihan Santri */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-10 text-center">Pilih</th>
                    <th className="py-3.5 px-4">Santri</th>
                    <th className="py-3.5 px-4">Pos Tagihan</th>
                    <th className="py-3.5 px-4">Bulan Hijriyah</th>
                    <th className="py-3.5 px-4">Nominal</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Aksi & Follow-Up WA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Memuat data tagihan santri...
                      </td>
                    </tr>
                  ) : santriBills.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Tidak ada data tagihan ditemukan.
                      </td>
                    </tr>
                  ) : (
                    santriBills.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedSantriIds.includes(b.santriId)}
                            onChange={() => handleToggleSantri(b.santriId)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{b.santri?.nama || 'Santri'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">NIS: {b.santri?.nis || '-'} • Kelas: {b.santri?.kelas || '-'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{b.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Kode: {b.billCode}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {b.hijriMonth} {b.hijriYear}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          Rp {parseFloat(b.amount || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-4">
                          {b.status === 'UNPAID' && (
                            <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold">
                              Belum Lunas
                            </span>
                          )}
                          {b.status === 'PENDING_VERIFICATION' && (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold">
                              Menunggu Verifikasi
                            </span>
                          )}
                          {b.status === 'PAID' && (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold">
                              Lunas
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {b.status === 'UNPAID' && (
                              <button
                                onClick={() => handleSendWaBillFollowup(b)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-bold transition-colors flex items-center gap-1 text-[10px]"
                                title="Kirim Tagihan ke WhatsApp Wali"
                              >
                                <MessageSquare className="w-3 h-3 text-emerald-600" />
                                <span>Tagih WA</span>
                              </button>
                            )}

                            {b.status === 'PAID' && (
                              <button
                                onClick={() => handleOpenPrintReceipt(b)}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold transition-colors flex items-center gap-1 text-[10px]"
                                title="Cetak Kwitansi Sah"
                              >
                                <Printer className="w-3 h-3 text-blue-600" />
                                <span>Kwitansi</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteSantriBill(b.id, b.title)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                              title="Hapus Tagihan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* ======================================================================= */}
      {/* 2. SUB-TAB MASTER TARIF TAGIHAN                                         */}
      {/* ======================================================================= */}
      {activeSubTab === 'master' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Daftar Master Tarif & Pos Tagihan Pesantren</h3>
            <p className="text-slate-500 mt-0.5">Kelola pos tarif syahriyah bulanan, tahunan, atau sekali bayar</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Nama Pos Tagihan</th>
                  <th className="py-3.5 px-4">Tipe Penagihan</th>
                  <th className="py-3.5 px-4">Nominal Standar</th>
                  <th className="py-3.5 px-4">Keterangan</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {masterBills.map((mb) => (
                  <tr key={mb.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{mb.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                        {mb.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      Rp {parseFloat(mb.amount || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{mb.description || '-'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditMaster(mb)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMaster(mb.id, mb.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
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
      {/* 3. SUB-TAB RIWAYAT KWITANSI SAH                                         */}
      {/* ======================================================================= */}
      {activeSubTab === 'receipts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Arsip Kwitansi Resmi Pesantren</h3>
              <p className="text-slate-500 mt-0.5">Daftar kwitansi sah berstempel digital yang telah diverifikasi Bendahara</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">No. Kwitansi</th>
                  <th className="py-3.5 px-4">Santri & Wali</th>
                  <th className="py-3.5 px-4">Rincian Pembayaran</th>
                  <th className="py-3.5 px-4">Total Nominal</th>
                  <th className="py-3.5 px-4">Tanggal ACC</th>
                  <th className="py-3.5 px-4 text-center">Cetak Kwitansi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {santriBills.filter(b => b.status === 'PAID').map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {b.receiptNumber || `KWT-${b.billCode}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{b.santri?.nama}</div>
                      <div className="text-[10px] text-slate-400 font-mono">NIS: {b.santri?.nis}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{b.title}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      Rp {parseFloat(b.amount || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {b.verifiedAt ? new Date(b.verifiedAt).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenPrintReceipt(b)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] transition-colors flex items-center justify-center gap-1 mx-auto shadow-sm"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Cetak Kwitansi Sah</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Master Form */}
      {isMasterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">
                {editingMaster ? 'Edit Master Pos Tagihan' : 'Tambah Master Pos Tagihan'}
              </h3>
              <button onClick={() => setIsMasterModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMaster} className="p-6 space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pos Tagihan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Syahriyah Bulanan KMI"
                  value={masterFormData.name}
                  onChange={(e) => setMasterFormData({ ...masterFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal Standar (Rp) *</label>
                <input
                  type="number"
                  required
                  placeholder="1200000"
                  value={masterFormData.amount}
                  onChange={(e) => setMasterFormData({ ...masterFormData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipe Penagihan</label>
                <select
                  value={masterFormData.type}
                  onChange={(e) => setMasterFormData({ ...masterFormData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-1 focus:ring-blue-600"
                >
                  <option value="BULANAN_HIJRIYAH">Per Bulan Hijriyah (Rutin)</option>
                  <option value="TAHUNAN">Tahunan (Awal Tahun Ajaran)</option>
                  <option value="SEKALI_BAYAR">Sekali Bayar (Pendaftaran / Wisuda)</option>
                  <option value="LAIN_LAIN">Lain-Lain</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Keterangan rincian tagihan..."
                  value={masterFormData.description}
                  onChange={(e) => setMasterFormData({ ...masterFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMasterModalOpen(false)}
                  className="w-1/3 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all"
                >
                  Simpan Master Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kwitansi Modal */}
      <OfficialReceipt
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        defaultData={activeReceiptData}
        readOnly={false}
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
