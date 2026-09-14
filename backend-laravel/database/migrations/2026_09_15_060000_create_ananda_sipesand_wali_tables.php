<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for Ananda by SiPesand (Aplikasi Wali Santri).
     */
    public function up(): void
    {
        // 1. Pesantrens (Multi-tenant master)
        if (!Schema::hasTable('pesantrens')) {
            Schema::create('pesantrens', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique(); // e.g. darulrahman
                $table->string('name');
                $table->string('slug')->unique();
                $table->string('phone')->nullable();
                $table->string('address')->nullable();
                $table->string('logo_url')->nullable();
                $table->string('banner_url')->nullable();
                $table->string('kaserapay_merchant_id')->nullable();
                $table->string('kaserapay_api_key')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // 2. Wali Santri
        if (!Schema::hasTable('wali_santris')) {
            Schema::create('wali_santris', function (Blueprint $table) {
                $table->id();
                $table->foreignId('pesantren_id')->constrained('pesantrens')->onDelete('cascade');
                $table->string('name');
                $table->string('whatsapp')->index();
                $table->string('relationship')->default('Ayah'); // Ayah / Ibu / Wali
                $table->text('address')->nullable();
                $table->string('avatar_url')->nullable();
                $table->string('otp_code')->nullable();
                $table->timestamp('otp_expires_at')->nullable();
                $table->boolean('is_verified')->default(false);
                $table->string('fcm_token')->nullable();
                $table->timestamps();
            });
        }

        // 3. Santris
        if (!Schema::hasTable('santris')) {
            Schema::create('santris', function (Blueprint $table) {
                $table->id();
                $table->foreignId('pesantren_id')->nullable()->constrained('pesantrens')->onDelete('cascade');
                $table->foreignId('wali_id')->nullable()->constrained('wali_santris')->nullOnDelete();
                $table->string('nis')->unique();
                $table->string('name');
                $table->string('nama')->nullable();
                $table->string('gender')->default('L');
                $table->string('kelas')->nullable(); // e.g. 3 Aliyah
                $table->string('kamar')->nullable(); // e.g. Al-Fatih 04
                $table->string('musyrif_name')->nullable();
                $table->string('musyrif_phone')->nullable();
                $table->string('photo_url')->nullable();
                $table->string('status')->default('Aktif');
                $table->decimal('saldo_uang_saku', 12, 2)->default(0);
                $table->timestamps();
            });
        } else {
            Schema::table('santris', function (Blueprint $table) {
                if (!Schema::hasColumn('santris', 'pesantren_id')) {
                    $table->foreignId('pesantren_id')->nullable()->constrained('pesantrens')->nullOnDelete();
                }
                if (!Schema::hasColumn('santris', 'wali_id')) {
                    $table->foreignId('wali_id')->nullable()->constrained('wali_santris')->nullOnDelete();
                }
                if (!Schema::hasColumn('santris', 'name')) {
                    $table->string('name')->nullable();
                }
                if (!Schema::hasColumn('santris', 'gender')) {
                    $table->string('gender')->default('L');
                }
                if (!Schema::hasColumn('santris', 'musyrif_name')) {
                    $table->string('musyrif_name')->nullable();
                }
                if (!Schema::hasColumn('santris', 'musyrif_phone')) {
                    $table->string('musyrif_phone')->nullable();
                }
                if (!Schema::hasColumn('santris', 'photo_url')) {
                    $table->string('photo_url')->nullable();
                }
                if (!Schema::hasColumn('santris', 'status')) {
                    $table->string('status')->default('Aktif');
                }
                if (!Schema::hasColumn('santris', 'saldo_uang_saku')) {
                    $table->decimal('saldo_uang_saku', 12, 2)->default(0);
                }
            });
        }

        // 4. Tagihan / Bills
        if (!Schema::hasTable('pembayarans')) {
            Schema::create('pembayarans', function (Blueprint $table) {
                $table->id();
                $table->foreignId('pesantren_id')->constrained('pesantrens')->onDelete('cascade');
                $table->foreignId('santri_id')->constrained('santris')->onDelete('cascade');
                $table->string('bill_no')->unique();
                $table->string('title'); // e.g. SPP September 2026, Uang Kitab
                $table->string('category')->default('SPP'); // SPP, Gedung, Seragam, Kegiatan
                $table->string('period')->nullable(); // 2026-09
                $table->decimal('amount', 12, 2);
                $table->decimal('admin_fee', 10, 2)->default(0);
                $table->decimal('total_amount', 12, 2);
                $table->date('due_date')->nullable();
                $table->enum('status', ['unpaid', 'pending', 'paid', 'cancelled'])->default('unpaid');
                $table->string('payment_method')->nullable(); // kaserapay, transfer_manual, qris, va
                $table->string('channel')->nullable(); // bca_va, bni_va, qris_kasera
                $table->string('payment_url')->nullable();
                $table->string('proof_url')->nullable(); // bukti transfer
                $table->timestamp('paid_at')->nullable();
                $table->string('verified_by')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // 5. Kwitansi Resmi
        if (!Schema::hasTable('kwitansis')) {
            Schema::create('kwitansis', function (Blueprint $table) {
                $table->id();
                $table->foreignId('pesantren_id')->constrained('pesantrens')->onDelete('cascade');
                $table->foreignId('pembayaran_id')->constrained('pembayarans')->onDelete('cascade');
                $table->string('receipt_no')->unique();
                $table->string('payer_name');
                $table->decimal('amount', 12, 2);
                $table->string('terbilang')->nullable();
                $table->string('description');
                $table->string('pdf_url')->nullable();
                $table->timestamps();
            });
        }

        // 6. Transaksi Uang Saku (Kantin/NFC/Topup)
        if (!Schema::hasTable('uang_sakus')) {
            Schema::create('uang_sakus', function (Blueprint $table) {
                $table->id();
                $table->foreignId('pesantren_id')->constrained('pesantrens')->onDelete('cascade');
                $table->foreignId('santri_id')->constrained('santris')->onDelete('cascade');
                $table->enum('type', ['topup', 'spend', 'withdraw', 'transfer'])->default('spend');
                $table->decimal('amount', 12, 2);
                $table->decimal('balance_after', 12, 2);
                $table->string('description'); // e.g. Kantin Al-Barokah, Top Up KaseraPay
                $table->string('merchant_name')->nullable();
                $table->string('nfc_card_uid')->nullable();
                $table->timestamps();
            });
        }

        // 7. Nilai & Rapor
        if (!Schema::hasTable('nilais')) {
            Schema::create('nilais', function (Blueprint $table) {
                $table->id();
                $table->foreignId('pesantren_id')->constrained('pesantrens')->onDelete('cascade');
                $table->foreignId('santri_id')->constrained('santris')->onDelete('cascade');
                $table->string('semester'); // Semester Ganjil 2026/2027
                $table->string('subject'); // Nahwu, Shorof, Fiqih, Tahfidz, B. Arab, B. Inggris, Matematika
                $table->decimal('score', 5, 2);
                $table->string('grade', 5)->default('A');
                $table->string('teacher_name')->nullable();
                $table->text('feedback')->nullable();
                $table->timestamps();
            });
        }

        // 8. Muhafadzoh & Tahfidz
        if (!Schema::hasTable('hafalans')) {
            Schema::create('hafalans', function (Blueprint $table) {
                $table->id();
                $table->foreignId('pesantren_id')->constrained('pesantrens')->onDelete('cascade');
                $table->foreignId('santri_id')->constrained('santris')->onDelete('cascade');
                $table->string('surah');
                $table->string('ayat_range');
                $table->string('juz');
                $table->enum('kualitas', ['Mumtaz', 'Jayyid Jiddan', 'Jayyid', 'Maqbul'])->default('Jayyid Jiddan');
                $table->string('musyrif_name');
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // 9. Absensi
        if (!Schema::hasTable('absensis')) {
            Schema::create('absensis', function (Blueprint $table) {
                $table->id();
                $table->foreignId('pesantren_id')->constrained('pesantrens')->onDelete('cascade');
                $table->foreignId('santri_id')->constrained('santris')->onDelete('cascade');
                $table->date('date');
                $table->enum('activity', ['Sholat Shubuh', 'Sholat Dzuhur', 'Sholat Ashar', 'Sholat Maghrib', 'Sholat Isya', 'KBM Pagi', 'KBM Sore', 'Halaqah Tahfidz'])->default('KBM Pagi');
                $table->enum('status', ['Hadir', 'Izin', 'Sakit', 'Alfa'])->default('Hadir');
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // 10. Perizinan Pulang
        if (!Schema::hasTable('perizinans')) {
            Schema::create('perizinans', function (Blueprint $table) {
                $table->id();
                $table->foreignId('pesantren_id')->constrained('pesantrens')->onDelete('cascade');
                $table->foreignId('santri_id')->constrained('santris')->onDelete('cascade');
                $table->foreignId('wali_id')->constrained('wali_santris')->onDelete('cascade');
                $table->string('reason'); // Liburan, Acara Keluarga, Berobat
                $table->text('description')->nullable();
                $table->dateTime('start_date');
                $table->dateTime('end_date');
                $table->dateTime('actual_return_date')->nullable();
                $table->string('attachment_url')->nullable(); // Surat dokter / undangan
                $table->enum('status', ['pending', 'approved', 'rejected', 'completed', 'overdue'])->default('pending');
                $table->string('approved_by')->nullable();
                $table->text('rejection_reason')->nullable();
                $table->string('qr_code_token')->nullable(); // for security gate scanning
                $table->timestamps();
            });
        }

        // 11. Pelanggaran & Catatan Kedisiplinan
        if (!Schema::hasTable('pelanggarans')) {
            Schema::create('pelanggarans', function (Blueprint $table) {
                $table->id();
                $table->foreignId('pesantren_id')->constrained('pesantrens')->onDelete('cascade');
                $table->foreignId('santri_id')->constrained('santris')->onDelete('cascade');
                $table->date('date');
                $table->string('violation'); // Terlambat jamaah, Merokok, dsb
                $table->integer('points')->default(5);
                $table->string('sanction')->nullable(); // Hukuman / Takzir
                $table->string('reported_by')->nullable();
                $table->timestamps();
            });
        }

        // 12. Pengumuman & Berita Pesantren
        if (!Schema::hasTable('pengumumans')) {
            Schema::create('pengumumans', function (Blueprint $table) {
                $table->id();
                $table->foreignId('pesantren_id')->constrained('pesantrens')->onDelete('cascade');
                $table->string('title');
                $table->text('content');
                $table->string('category')->default('Umum'); // Akademik, Libur, Kegiatan, Keuangan
                $table->string('image_url')->nullable();
                $table->boolean('is_pinned')->default(false);
                $table->timestamps();
            });
        }

        // 13. Chat Rooms (Wali to Musyrif/Pengurus/Admin)
        if (!Schema::hasTable('chat_rooms')) {
            Schema::create('chat_rooms', function (Blueprint $table) {
                $table->id();
                $table->foreignId('pesantren_id')->constrained('pesantrens')->onDelete('cascade');
                $table->foreignId('wali_id')->constrained('wali_santris')->onDelete('cascade');
                $table->foreignId('santri_id')->constrained('santris')->onDelete('cascade');
                $table->string('title'); // e.g. Musyrif Ust. Ahmad (Kamar Al-Fatih 04)
                $table->string('role_target')->default('Musyrif'); // Musyrif, Bendahara, Admin
                $table->string('target_name');
                $table->string('target_avatar')->nullable();
                $table->text('last_message')->nullable();
                $table->dateTime('last_message_at')->nullable();
                $table->integer('unread_wali_count')->default(0);
                $table->timestamps();
            });
        }

        // 14. Chat Messages (Realtime WA-Style)
        if (!Schema::hasTable('chat_messages')) {
            Schema::create('chat_messages', function (Blueprint $table) {
                $table->id();
                $table->foreignId('chat_room_id')->constrained('chat_rooms')->onDelete('cascade');
                $table->enum('sender_type', ['wali', 'pesantren'])->default('wali');
                $table->string('sender_name');
                $table->enum('type', ['text', 'image', 'document', 'voice'])->default('text');
                $table->text('message')->nullable();
                $table->string('media_url')->nullable();
                $table->boolean('is_read')->default(false);
                $table->timestamps();
            });
        }

        // 15. Wali Notifications (Push notification archive)
        if (!Schema::hasTable('wali_notifications')) {
            Schema::create('wali_notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('pesantren_id')->constrained('pesantrens')->onDelete('cascade');
                $table->foreignId('wali_id')->constrained('wali_santris')->onDelete('cascade');
                $table->string('title');
                $table->text('body');
                $table->string('type')->default('general'); // bill, chat, permit, attendance, announcement
                $table->string('action_url')->nullable();
                $table->boolean('is_read')->default(false);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wali_notifications');
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chat_rooms');
        Schema::dropIfExists('pengumumans');
        Schema::dropIfExists('pelanggarans');
        Schema::dropIfExists('perizinans');
        Schema::dropIfExists('absensis');
        Schema::dropIfExists('hafalans');
        Schema::dropIfExists('nilais');
        Schema::dropIfExists('uang_sakus');
        Schema::dropIfExists('kwitansis');
        Schema::dropIfExists('pembayarans');
        Schema::dropIfExists('santris');
        Schema::dropIfExists('wali_santris');
        Schema::dropIfExists('pesantrens');
    }
};
