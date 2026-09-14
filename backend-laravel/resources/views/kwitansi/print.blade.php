<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kwitansi Resmi {{ $kwitansi->receipt_no }} - {{ $santri->name ?? $santri->nama }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; }
        body { background: #f1f5f9; padding: 24px; color: #1e293b; }
        .receipt-card { max-width: 680px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: #07266E; color: #fff; padding: 24px 28px; display: flex; align-items: center; justify-content: space-between; }
        .pesantren-info h2 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
        .pesantren-info p { font-size: 12px; opacity: 0.9; }
        .receipt-badge { text-align: right; }
        .receipt-badge .title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #93c5fd; }
        .receipt-badge .number { font-size: 16px; font-weight: 700; color: #fff; }
        .body-content { padding: 28px; }
        .row { display: flex; margin-bottom: 14px; font-size: 14px; }
        .label { width: 160px; color: #64748b; font-weight: 500; }
        .value { flex: 1; color: #0f172a; font-weight: 600; }
        .amount-box { background: #f8fafc; border: 2px dashed #07266E; border-radius: 8px; padding: 18px; margin: 20px 0; text-align: center; }
        .amount-box .nominal { font-size: 26px; font-weight: 800; color: #07266E; }
        .amount-box .terbilang { font-size: 13px; font-style: italic; color: #475569; margin-top: 6px; }
        .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
        .stamp { border: 2px solid #16a34a; color: #16a34a; padding: 6px 14px; border-radius: 6px; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; }
        .sign { text-align: center; width: 180px; }
        .sign .signature-line { margin-top: 50px; border-bottom: 1px solid #0f172a; }
        .sign p { font-size: 12px; color: #64748b; margin-top: 4px; }
        .actions { text-align: center; margin-top: 20px; }
        .btn-print { background: #07266E; color: #fff; border: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
        @media print {
            body { background: #fff; padding: 0; }
            .receipt-card { box-shadow: none; border: none; width: 100%; }
            .actions { display: none; }
        }
    </style>
</head>
<body>
    <div class="receipt-card">
        <div class="header">
            <div class="pesantren-info">
                <h2>{{ $pesantren->name }}</h2>
                <p>{{ $pesantren->address }} | Telp: {{ $pesantren->phone }}</p>
            </div>
            <div class="receipt-badge">
                <div class="title">KWITANSI RESMI</div>
                <div class="number">{{ $kwitansi->receipt_no }}</div>
            </div>
        </div>
        <div class="body-content">
            <div class="row">
                <div class="label">Telah Terima Dari</div>
                <div class="value">: {{ $kwitansi->payer_name }}</div>
            </div>
            <div class="row">
                <div class="label">Nama Santri</div>
                <div class="value">: {{ $santri->name ?? $santri->nama }} (NIS: {{ $santri->nis }})</div>
            </div>
            <div class="row">
                <div class="label">Kelas / Kamar</div>
                <div class="value">: {{ $santri->kelas }} / {{ $santri->kamar }}</div>
            </div>
            <div class="row">
                <div class="label">Untuk Pembayaran</div>
                <div class="value">: {{ $kwitansi->description }}</div>
            </div>
            <div class="row">
                <div class="label">Tanggal Bayar</div>
                <div class="value">: {{ \Carbon\Carbon::parse($bill->paid_at ?? $kwitansi->created_at)->translatedFormat('d F Y H:i') }} WIB</div>
            </div>
            <div class="row">
                <div class="label">Kanal Pembayaran</div>
                <div class="value">: {{ strtoupper($bill->payment_method ?? 'KASERAPAY') }} ({{ strtoupper($bill->channel ?? 'QRIS') }})</div>
            </div>

            <div class="amount-box">
                <div class="nominal">Rp {{ number_format($kwitansi->amount, 0, ',', '.') }}</div>
                <div class="terbilang">Terbilang: # {{ $kwitansi->terbilang }} #</div>
            </div>

            <div class="footer">
                <div>
                    <div class="stamp">LUNAS TERVERIFIKASI</div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">Otentikasi Digital SiPesand Ananda</div>
                </div>
                <div class="sign">
                    <div style="font-size: 12px; color: #64748b;">Bendahara Pesantren</div>
                    <div class="signature-line"></div>
                    <p>{{ $pesantren->name }}</p>
                </div>
            </div>
        </div>
    </div>

    <div class="actions">
        <button class="btn-print" onclick="window.print()">Cetak / Simpan Sebagai PDF</button>
    </div>
</body>
</html>
