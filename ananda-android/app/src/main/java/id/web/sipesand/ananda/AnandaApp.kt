package id.web.sipesand.ananda

import android.app.Application
import android.content.Context
import android.content.SharedPreferences

class AnandaApp : Application() {
    companion object {
        lateinit var instance: AnandaApp; private set
        lateinit var prefs: SharedPreferences; private set
        private const val PREF = "ananda_v2_prefs"
        private const val K_TOKEN = "token"
        private const val K_PID = "pesantren_id"
        private const val K_PCODE = "pesantren_code"
        private const val K_PNAME = "pesantren_name"
        private const val K_PSLUG = "pesantren_slug"
        private const val K_WALI = "wali_name"
        private const val K_SANTRI = "santri_name"
        private const val K_NIS = "santri_nis"
        fun token(): String? = prefs.getString(K_TOKEN, null)
        fun tenantSlug(): String = prefs.getString(K_PSLUG, "") ?: ""
        fun tenantCode(): String = prefs.getString(K_PCODE, "") ?: ""
        fun pesantrenId(): Long = prefs.getLong(K_PID, 0L)
        fun pesantrenName(): String = prefs.getString(K_PNAME, "") ?: ""
        fun waliName(): String = prefs.getString(K_WALI, "Wali Santri") ?: "Wali Santri"
        fun saveAuth(token: String, pid: Long, pname: String, pcode: String?, slug: String?, wali: String, santri: String?, nis: String?) {
            prefs.edit().apply{
                putString(K_TOKEN, token); putLong(K_PID, pid); putString(K_PNAME, pname)
                putString(K_PCODE, pcode ?: ""); putString(K_PSLUG, slug ?: pcode ?: "")
                putString(K_WALI, wali); putString(K_SANTRI, santri ?: ""); putString(K_NIS, nis ?: "")
                apply()
            }
        }
        fun savePesantren(id: Long, name: String, code: String, slug: String?) {
            prefs.edit().apply{ putLong(K_PID, id); putString(K_PNAME, name); putString(K_PCODE, code); putString(K_PSLUG, slug ?: code); apply() }
        }
        fun clear(){
            val pid=prefs.getLong(K_PID,0L); val pname=prefs.getString(K_PNAME,null); val pcode=prefs.getString(K_PCODE,null); val pslug=prefs.getString(K_PSLUG,null)
            prefs.edit().clear().apply()
            if(pname!=null) prefs.edit().apply{ putLong(K_PID,pid); putString(K_PNAME,pname); if(pcode!=null) putString(K_PCODE,pcode); if(pslug!=null) putString(K_PSLUG,pslug); apply() }
        }
        fun isLogged(): Boolean = !token().isNullOrBlank()
        // Compatibility aliases for legacy screens
        fun getToken(): String? = token()
        fun getWaliName(): String = waliName()
        fun getSelectedPesantrenId(): Long = pesantrenId().let{ if(it==0L) 1L else it }
        fun getSelectedPesantrenName(): String = pesantrenName()
        fun getPesantrenCode(): String = tenantCode()
        fun getTenantSubdomain(): String = tenantSlug()
        fun getSantriName(): String = prefs.getString(K_SANTRI,"") ?: ""
        fun getSantriNis(): String = prefs.getString(K_NIS,"") ?: ""
        fun saveAuthSession(token:String, pesantrenId:Long, pesantrenName:String, waliName:String, santriName:String?, santriNis:String?){
            saveAuth(token, pesantrenId, pesantrenName, null, null, waliName, santriName, santriNis)
        }
        fun savePesantrenSelection(id:Long, name:String, code:String, slug:String?){ savePesantren(id,name,code,slug) }
    }
    override fun onCreate() { super.onCreate(); instance=this; prefs=getSharedPreferences(PREF, Context.MODE_PRIVATE) }
}
