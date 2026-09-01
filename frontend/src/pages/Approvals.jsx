import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Receipt, 
  DollarSign, 
  FileText, 
  ExternalLink, 
  Plus, 
  Building2, 
  AlertCircle,
  X,
  Upload,
  Printer
} from 'lucide-react';
import { 
  getPendingOnlinePayments, 
  verifyBillPayment, 
  getDivisionFunds, 
  createDivisionFund, 
  updateDivisionFundStatus 
} from '../services/api';
import OfficialReceipt from '../components/OfficialReceipt';

export default function Approvals() {
  const [activeTab, setActiveTab] = useState('payments'); // 'payments' | 'division-funds'
  
  // Data States
  const [pendingPayments, setPendingPayments] = useState([]);
  const [divisionFunds, setDivisionFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);

  // Modal Detail Bukti & ACC
  const [selectedPaymentForAcc, setSelectedPaymentForAcc] = useState(null);
  const [accNotes, setAccNotes] = useState('');
  const [processingAcc, setProcessingAcc] = useState(false);

  // Modal Pengajuan Dana Divisi Baru
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [fundFormData, setFundFormData] = useState({
    division: 'DIVISI_KEAMANAN',
    title: '',
    amount: '',
    description: '',
    requestedBy: 'Pengurus Divisi',
  });

  // Modal Cetak Kwitansi
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [activeReceiptData, setActiveReceiptData] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'payments') {
        const res = await getPendingOnlinePayments();
        if (res.data.success) setPendingPayments(res.data.data);
      } else {
        const res = await getDivisionFunds();
        if (res.data.success) setDivisionFunds(res.data.data);
      }
    } catch (err) {
      console.error('Error loadData Approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAccPayment = async (bill) => {
    try {
      setProcessingAcc(true);
      const res = await verifyBillPayment(bill.id, {
        verifiedBy: 'Ustadz Ridwan, S.E. (Bendahara)',
        notes: accNotes || 'Pembayaran online diverifikasi sah',
      });

      if (res.data.success) {
        setActionMessage({ type: 'success', text: res.data.message });
        setSelectedPaymentForAcc(null);
        setAccNotes('');
        loadData();
        
        // Tawarkan buka kwitansi
        setActiveReceiptData({
          code: res.data.data?.receiptNumber || `KWT-${bill.billCode}`,
          date: new Date(),
          santriName: bill.santri?.nama,
          waliName: bill.santri?.namaWali || 'Wali Santri',
          nis: bill.santri?.nis,
          kelas: bill.santri?.kelas,
          items: [{ id: bill.id, name: bill.title, amount: bill.amount }]
        });
        setIsReceiptOpen(true);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Gagal memverifikasi pembayaran' });
    } finally {
      setProcessingAcc(false);
    }
  };

  const handleUpdateFundStatus = async (fundId, status) => {
    const confirmText = status === 'APPROVED' ? 'Setujui dan cairkan dana ini ke kas pengeluaran?' : 'Tolak pengajuan dana ini?';
    if (!window.confirm(confirmText)) return;

    try {
      const res = await updateDivisionFundStatus(fundId, {
        status,
        approvedBy: 'Ustadz Ridwan, S.E. (Bendahara)',
      });
      if (res.data.success) {
        setActionMessage({ type: 'success', text: res.data.message });
        loadData();
      }
    } catch (err) {
      alert('Gagal memproses persetujuan dana');
    }
  };

  const handleCreateFund = async (e) => {
    e.preventDefault();
    try {
      const res = await createDivisionFund(fundFormData);
      if (res.data.success) {
        setIsFundModalOpen(false);
        setFundFormData({
          division: 'DIVISI_KEAMANAN',
          title: '',
          amount: '',
          description: '',
          requestedBy: 'Pengurus Divisi',
        });
        setActionMessage({ type: 'success', text: 'Pengajuan dana berhasil diajukan!' });
        loadData();
      }
    } catch (err) {
      alert('Gagal membuat pengajuan dana');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'payments'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Verifikasi Pembayaran Wali Online</span>
            {pendingPayments.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
                {pendingPayments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('division-funds')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'division-funds'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Persetujuan Dana Divisi (ACC)</span>
          </button>
        </div>

        {activeTab === 'division-funds' && (
          <button
            onClick={() => setIsFundModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ajukan Dana Divisi</span>
          </button>
        )}
      </div>

      {actionMessage && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 animate-in fade-in ${
          actionMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{actionMessage.text}</span>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 1. TAB VERIFIKASI PEMBAYARAN WALI ONLINE                                */}
      {/* ======================================================================= */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Pembayaran Online Wali Menunggu ACC Bendahara</h3>
              <p className="text-xs text-slate-400">Verifikasi bukti transfer sebelum diterbitkan kwitansi dan dicatat ke Buku Kas</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Santri & Wali</th>
                  <th className="py-3.5 px-4">Pos Tagihan</th>
                  <th className="py-3.5 px-4">Metode & Tanggal</th>
                  <th className="py-3.5 px-4">Nominal</th>
                  <th className="py-3.5 px-4 text-center">Bukti Transfer</th>
                  <th className="py-3.5 px-4 text-center">Aksi Persetujuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">Memuat verifikasi pembayaran...</td>
                  </tr>
                ) : pendingPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                      <div className="font-bold text-slate-800">Semua Pembayaran Telah Di-verifikasi</div>
                      <p className="text-xs text-slate-400">Tidak ada bukti transfer online yang tertunda saat ini.</p>
                    </td>
                  </tr>
                ) : (
                  pendingPayments.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{bill.santri?.nama}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          NIS: {bill.santri?.nis} • Wali: {bill.santri?.namaWali || '-'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{bill.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Kode: {bill.billCode}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-blue-700 block">{bill.paymentMethod || 'TRANSFER_BSI'}</span>
                        <span className="text-[10px] text-slate-400">
                          {bill.paymentDate ? new Date(bill.paymentDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-sm text-slate-900">
                        Rp {bill.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {bill.proofImage ? (
                          <a
                            href={bill.proofImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Lihat Bukti</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Tanpa lampiran</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedPaymentForAcc(bill)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-all flex items-center gap-1.5 mx-auto"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ACC & Kwitansi</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 2. TAB PERSETUJUAN PENGGUNAAN DANA DIVISI                               */}
      {/* ======================================================================= */}
      {activeTab === 'division-funds' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Pengajuan & Persetujuan Dana Operasional Divisi</h3>
              <p className="text-xs text-slate-400">Verifikasi pengajuan dana divisi Keamanan, Dapur, Sarpras, dan Pendidikan</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Kode & Divisi</th>
                  <th className="py-3.5 px-4">Judul Pengajuan</th>
                  <th className="py-3.5 px-4">Nominal</th>
                  <th className="py-3.5 px-4">Pemohon</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Aksi ACC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">Memuat data pengajuan dana...</td>
                  </tr>
                ) : divisionFunds.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">Belum ada pengajuan dana divisi</td>
                  </tr>
                ) : (
                  divisionFunds.map((fund) => (
                    <tr key={fund.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-blue-700 block">{fund.code}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold inline-block mt-0.5 border border-slate-200">
                          {fund.division}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{fund.title}</div>
                        <div className="text-[11px] text-slate-500">{fund.description}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-sm text-slate-900">
                        Rp {fund.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-medium">{fund.requestedBy}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(fund.createdAt).toLocaleDateString('id-ID')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          fund.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : fund.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {fund.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {fund.status === 'PENDING' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleUpdateFundStatus(fund.id, 'APPROVED')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition-colors"
                            >
                              ACC Dana
                            </button>
                            <button
                              onClick={() => handleUpdateFundStatus(fund.id, 'REJECTED')}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-[11px] font-bold transition-colors"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-semibold">
                            {fund.approvedBy ? `Disetujui: ${fund.approvedBy}` : 'Selesai diproses'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog ACC Pembayaran */}
      {selectedPaymentForAcc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 text-xs">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm">Verifikasi Pembayaran & Terbitkan Kwitansi</h3>
              <button onClick={() => setSelectedPaymentForAcc(null)} className="text-white hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Santri:</span>
                  <strong className="text-slate-900">{selectedPaymentForAcc.santri?.nama}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pos Tagihan:</span>
                  <strong className="text-slate-900">{selectedPaymentForAcc.title}</strong>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="text-slate-500 font-bold">Total Nominal:</span>
                  <strong className="font-mono text-base text-blue-700 font-black">
                    Rp {selectedPaymentForAcc.amount.toLocaleString('id-ID')}
                  </strong>
                </div>
              </div>

              {selectedPaymentForAcc.proofImage && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-700">Bukti Transfer:</span>
                  <div className="max-h-48 overflow-hidden rounded-xl border border-slate-200">
                    <img src={selectedPaymentForAcc.proofImage} alt="Bukti Transfer" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Bendahara (Opsional)</label>
                <input
                  type="text"
                  value={accNotes}
                  onChange={(e) => setAccNotes(e.target.value)}
                  placeholder="Contoh: Dana masuk rekening BSI, valid"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentForAcc(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={processingAcc}
                  onClick={() => handleExecuteAccPayment(selectedPaymentForAcc)}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md flex items-center gap-2"
                >
                  {processingAcc ? 'Memproses...' : 'Setujui & Terbitkan Kwitansi Resmi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Pengajuan Dana Divisi */}
      {isFundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 text-xs">
            <div className="bg-blue-700 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Formulir Pengajuan Dana Divisi</h3>
              <button onClick={() => setIsFundModalOpen(false)} className="text-white hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateFund} className="p-5 space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Divisi *</label>
                <select
                  value={fundFormData.division}
                  onChange={(e) => setFundFormData({ ...fundFormData, division: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DIVISI_KEAMANAN">Divisi Keamanan & Kamtib</option>
                  <option value="DIVISI_DAPUR">Divisi Dapur & Logistik Santri</option>
                  <option value="DIVISI_SARPRAS">Divisi Sarana & Prasarana</option>
                  <option value="DIVISI_PENDIDIKAN">Divisi Pendidikan & Muhafadzoh</option>
                  <option value="DIVISI_KESEHATAN">Divisi Kesehatan & Poskestren</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Keperluan Pengajuan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembelian Gas & Bahan Dapur Pekanan"
                  value={fundFormData.title}
                  onChange={(e) => setFundFormData({ ...fundFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal Anggaran (Rp) *</label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  value={fundFormData.amount}
                  onChange={(e) => setFundFormData({ ...fundFormData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rincian / Keterangan</label>
                <textarea
                  rows={3}
                  placeholder="Rincian pos pengeluaran..."
                  value={fundFormData.description}
                  onChange={(e) => setFundFormData({ ...fundFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pemohon</label>
                <input
                  type="text"
                  value={fundFormData.requestedBy}
                  onChange={(e) => setFundFormData({ ...fundFormData, requestedBy: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFundModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kwitansi Resmi */}
      <OfficialReceipt
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        defaultData={activeReceiptData}
      />

    </div>
  );
}
