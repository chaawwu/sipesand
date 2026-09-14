package id.web.sipesand.app;

import android.app.PendingIntent;
import android.content.Intent;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import com.getcapacitor.BridgeActivity;

import org.json.JSONObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "SiPesandNFC";
    private NfcAdapter nfcAdapter;
    private PendingIntent pendingIntent;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 1. Inisialisasi NfcAdapter Native Android
        nfcAdapter = NfcAdapter.getDefaultAdapter(this);

        if (nfcAdapter == null) {
            Log.w(TAG, "Perangkat ini tidak memiliki hardware NFC.");
        } else if (!nfcAdapter.isEnabled()) {
            Toast.makeText(this, "NFC terpasang tetapi belum aktif. Silakan aktifkan NFC di Pengaturan HP.", Toast.LENGTH_LONG).show();
        }

        // 2. Siapkan PendingIntent untuk Foreground Dispatch
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            flags |= PendingIntent.FLAG_MUTABLE;
        }

        Intent intent = new Intent(this, getClass()).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        pendingIntent = PendingIntent.getActivity(this, 0, intent, flags);

        // 3. Cek apakah activity dibuka pertama kali dengan tag NFC
        handleNfcIntent(getIntent());
    }

    @Override
    public void onResume() {
        super.onResume();
        if (nfcAdapter != null && nfcAdapter.isEnabled()) {
            try {
                nfcAdapter.enableForegroundDispatch(this, pendingIntent, null, null);
                Log.d(TAG, "NFC Foreground Dispatch ENABLED");
            } catch (Exception e) {
                Log.e(TAG, "Error enabling NFC foreground dispatch: " + e.getMessage());
            }
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        if (nfcAdapter != null) {
            try {
                nfcAdapter.disableForegroundDispatch(this);
                Log.d(TAG, "NFC Foreground Dispatch DISABLED");
            } catch (Exception e) {
                Log.e(TAG, "Error disabling NFC foreground dispatch: " + e.getMessage());
            }
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleNfcIntent(intent);
    }

    /**
     * Membaca tag NFC kartu KTSD dan memproses UID secara native
     */
    private void handleNfcIntent(Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();

        if (NfcAdapter.ACTION_TAG_DISCOVERED.equals(action) ||
            NfcAdapter.ACTION_TECH_DISCOVERED.equals(action) ||
            NfcAdapter.ACTION_NDEF_DISCOVERED.equals(action)) {

            Tag tag = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG);
            if (tag != null) {
                byte[] idBytes = tag.getId();
                if (idBytes != null && idBytes.length > 0) {
                    String uidHex = bytesToHex(idBytes).toUpperCase();
                    Log.i(TAG, "KARTU KTSD TERDETEKSI: " + uidHex);

                    runOnUiThread(() -> {
                        Toast.makeText(this, "Kartu KTSD Terbaca: " + uidHex, Toast.LENGTH_SHORT).show();
                    });

                    // 1. Kirim UID ke Web Layer melalui JavaScript Bridge
                    dispatchNfcToWeb(uidHex);

                    // 2. Kirim secara background langsung ke backend API /api/nfc/scan
                    postNfcToBackend(uidHex);
                }
            }
        }
    }

    /**
     * Mengubah byte array menjadi format Hex string
     */
    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02X", b));
        }
        return sb.toString();
    }

    /**
     * Mengirim UID kartu ke WebView agar UI React langsung merespon
     */
    private void dispatchNfcToWeb(final String uid) {
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().post(() -> {
                String js = "window.dispatchEvent(new CustomEvent('nativeNfcScanned', { detail: { uid: '" + uid + "' } }));";
                getBridge().getWebView().evaluateJavascript(js, null);
            });
        }
    }

    /**
     * Kirim data absensi KTSD ke backend API SiPesand
     */
    private void postNfcToBackend(final String uid) {
        new Thread(() -> {
            try {
                URL url = new URL("https://sipesand.web.id/api/nfc/scan");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                conn.setRequestProperty("Accept", "application/json");
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(5000);
                conn.setDoOutput(true);

                JSONObject json = new JSONObject();
                json.put("nfc_uid", uid);
                json.put("action_type", "AUTO");
                json.put("device_info", "Android Native (" + Build.MANUFACTURER + " " + Build.MODEL + ")");

                byte[] input = json.toString().getBytes(StandardCharsets.UTF_8);
                try (OutputStream os = conn.getOutputStream()) {
                    os.write(input, 0, input.length);
                }

                int responseCode = conn.getResponseCode();
                Log.d(TAG, "POST /api/nfc/scan Response Code: " + responseCode);
                conn.disconnect();
            } catch (Exception e) {
                Log.w(TAG, "Background postNfcToBackend skipped/failed: " + e.getMessage());
            }
        }).start();
    }
}

