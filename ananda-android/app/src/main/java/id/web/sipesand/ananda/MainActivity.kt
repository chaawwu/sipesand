package id.web.sipesand.ananda

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import id.web.sipesand.ananda.ui.screens.*
import id.web.sipesand.ananda.ui.theme.AnandaTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            AnandaTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()

                    var selectedPesantrenId by remember { mutableStateOf(AnandaApp.getSelectedPesantrenId()) }
                    var selectedPesantrenName by remember { mutableStateOf(AnandaApp.getSelectedPesantrenName().ifBlank { "Pilih Pesantren" }) }
                    var selectedPesantrenCode by remember { mutableStateOf(AnandaApp.getPesantrenCode()) }

                    NavHost(
                        navController = navController,
                        startDestination = "splash"
                    ) {
                        // 1. Splash Screen
                        composable("splash") {
                            SplashScreen(
                                onNavigateNext = { route ->
                                    navController.navigate(route) {
                                        popUpTo("splash") { inclusive = true }
                                    }
                                }
                            )
                        }

                        // 2. Pilih Pondok Pesantren - sinkron tenant DB
                        composable("pesantren_select") {
                            PesantrenSelectScreen(
                                onPesantrenSelected = { id, name ->
                                    selectedPesantrenId = id
                                    selectedPesantrenName = name
                                    // Cari code dari prefs jika ada
                                    selectedPesantrenCode = AnandaApp.getPesantrenCode()
                                    navController.navigate("login")
                                }
                            )
                        }

                        // 3. Login WhatsApp OTP
                        composable("login") {
                            LoginScreen(
                                pesantrenId = selectedPesantrenId,
                                pesantrenName = selectedPesantrenName,
                                onBack = { navController.popBackStack() },
                                onLoginSuccess = {
                                    navController.navigate("dashboard") {
                                        popUpTo("login") { inclusive = true }
                                    }
                                },
                                onNavigateRegister = {
                                    navController.navigate("register")
                                }
                            )
                        }

                        // 4. Registrasi Akun Wali - verifikasi otomatis sinkron DB tenant
                        composable("register") {
                            RegisterScreen(
                                pesantrenId = selectedPesantrenId,
                                pesantrenName = selectedPesantrenName,
                                onBack = { navController.popBackStack() },
                                onRegisterSuccess = {
                                    navController.navigate("login") {
                                        popUpTo("register") { inclusive = true }
                                    }
                                }
                            )
                        }

                        // 5. Dashboard Home (Matches Reference Images 1 & 2)
                        composable("dashboard") {
                            DashboardScreen(
                                onNavigate = { route ->
                                    when (route) {
                                        "dashboard" -> {}
                                        "fees" -> navController.navigate("fees")
                                        "chat" -> navController.navigate("chat")
                                        "perizinan" -> navController.navigate("perizinan")
                                        "grades" -> navController.navigate("grades")
                                        "tahfidz" -> navController.navigate("tahfidz")
                                        "attendance" -> navController.navigate("attendance")
                                        "notices" -> navController.navigate("notices")
                                        else -> navController.navigate(route)
                                    }
                                }
                            )
                        }

                        // 6. Keuangan, Tagihan & Saldo Saku
                        composable("fees") {
                            KeuanganScreen(
                                onNavigate = { route ->
                                    if (route == "dashboard") navController.popBackStack()
                                    else navController.navigate(route)
                                },
                                onOpenKwitansi = { receiptNo ->
                                    navController.navigate("kwitansi/$receiptNo")
                                }
                            )
                        }

                        // 7. Kwitansi Resmi Sah Detail
                        composable(
                            route = "kwitansi/{receiptNo}",
                            arguments = listOf(navArgument("receiptNo") { type = NavType.StringType })
                        ) { backStackEntry ->
                            val receiptNo = backStackEntry.arguments?.getString("receiptNo") ?: "KW-202608-0012"
                            KwitansiScreen(
                                receiptNo = receiptNo,
                                onBack = { navController.popBackStack() }
                            )
                        }

                        // 8. Akademik Rapor & Jadwal
                        composable("akademik") {
                            AkademikScreen(
                                initialTab = 0,
                                onNavigate = { route -> navController.navigate(route) }
                            )
                        }
                        composable("grades") {
                            AkademikScreen(
                                initialTab = 0,
                                onNavigate = { route -> navController.navigate(route) }
                            )
                        }

                        // 9. Tahfidz & Muhafadzoh
                        composable("tahfidz") {
                            AkademikScreen(
                                initialTab = 1,
                                onNavigate = { route -> navController.navigate(route) }
                            )
                        }

                        // 10. Absensi Kehadiran & Sholat
                        composable("attendance") {
                            AkademikScreen(
                                initialTab = 2,
                                onNavigate = { route -> navController.navigate(route) }
                            )
                        }

                        // 11. Realtime Chat WA-Style
                        composable("chat") {
                            ChatScreen(
                                onNavigate = { route ->
                                    if (route == "dashboard") navController.popBackStack()
                                    else navController.navigate(route)
                                }
                            )
                        }

                        // 12. Perizinan Pulang & Barcode Gate Satpam
                        composable("perizinan") {
                            PerizinanScreen(
                                onNavigate = { route ->
                                    if (route == "dashboard") navController.popBackStack()
                                    else navController.navigate(route)
                                }
                            )
                        }

                        // 13. Pengumuman / Notices
                        composable("notices") {
                            DashboardScreen(
                                onNavigate = { route -> navController.navigate(route) }
                            )
                        }
                    }
                }
            }
        }
    }
}
