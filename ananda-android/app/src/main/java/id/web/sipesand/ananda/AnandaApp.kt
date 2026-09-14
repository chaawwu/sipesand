package id.web.sipesand.ananda

import android.app.Application
import android.content.Context
import android.content.SharedPreferences

class AnandaApp : Application() {

    companion object {
        lateinit var instance: AnandaApp
            private set
        lateinit var prefs: SharedPreferences
            private set

        private const val PREFS_NAME = "ananda_sipesand_prefs"
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_PESANTREN_ID = "pesantren_id"
        private const val KEY_PESANTREN_NAME = "pesantren_name"
        private const val KEY_WALI_NAME = "wali_name"
        private const val KEY_SANTRI_NAME = "santri_name"
        private const val KEY_SANTRI_NIS = "santri_nis"

        fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

        fun saveAuthSession(
            token: String,
            pesantrenId: Long,
            pesantrenName: String,
            waliName: String,
            santriName: String?,
            santriNis: String?
        ) {
            prefs.edit().apply {
                putString(KEY_TOKEN, token)
                putLong(KEY_PESANTREN_ID, pesantrenId)
                putString(KEY_PESANTREN_NAME, pesantrenName)
                putString(KEY_WALI_NAME, waliName)
                putString(KEY_SANTRI_NAME, santriName)
                putString(KEY_SANTRI_NIS, santriNis)
                apply()
            }
        }

        fun clearSession() {
            prefs.edit().clear().apply()
        }

        fun getSelectedPesantrenId(): Long = prefs.getLong(KEY_PESANTREN_ID, 1L)
        fun getWaliName(): String = prefs.getString(KEY_WALI_NAME, "Wali Santri") ?: "Wali Santri"
        fun getSantriName(): String = prefs.getString(KEY_SANTRI_NAME, "Muhammad Farhan") ?: "Muhammad Farhan"
        fun getSantriNis(): String = prefs.getString(KEY_SANTRI_NIS, "202409001") ?: "202409001"
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }
}
