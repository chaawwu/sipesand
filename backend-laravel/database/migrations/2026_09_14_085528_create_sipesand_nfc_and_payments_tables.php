<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tabel Santri
        Schema::create('santris', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_subdomain')->default('darulrahman')->index();
            $table->string('nis')->unique();
            $table->string('nama');
            $table->string('kelas')->nullable();
            $table->string('kamar')->nullable();
            $table->string('nfc_uid')->nullable()->index();
            $table->string('status_kehadiran')->default('PULANG'); // MASUK | PULANG
            $table->decimal('saldo_saku', 12, 2)->default(0);
            $table->string('wali_nama')->nullable();
            $table->string('wali_phone')->nullable();
            $table->timestamps();
        });

        // 2. Tabel Absensi NFC (KTSD)
        Schema::create('nfc_attendances', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_subdomain')->default('darulrahman')->index();
            $table->foreignId('santri_id')->nullable()->constrained('santris')->nullOnDelete();
            $table->string('nfc_uid');
            $table->string('action_type')->default('MASUK'); // MASUK | PULANG | CEK_SALDO
            $table->string('device_info')->nullable();
            $table->timestamp('scanned_at')->useCurrent();
            $table->json('extra_metadata')->nullable();
            $table->timestamps();
        });

        // 3. Tabel Pembayaran KaseraPay Santri
        Schema::create('kaserapay_payments', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_subdomain')->default('darulrahman')->index();
            $table->foreignId('santri_id')->nullable()->constrained('santris')->nullOnDelete();
            $table->string('bill_id')->nullable()->index(); // ID Tagihan SPP
            $table->string('external_id')->unique(); // ID Transaksi Unik KaseraPay
            $table->string('transaction_id')->nullable(); // ID dari KaseraPay
            $table->decimal('amount', 12, 2);
            $table->string('title')->nullable();
            $table->string('payment_method')->nullable(); // QRIS, VA_BCA, VA_BRI, dsb.
            $table->string('status')->default('PENDING'); // PENDING | PAID | EXPIRED | FAILED
            $table->text('checkout_url')->nullable();
            $table->text('qr_string')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->json('raw_response')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kaserapay_payments');
        Schema::dropIfExists('nfc_attendances');
        Schema::dropIfExists('santris');
    }
};
