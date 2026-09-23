package id.web.sipesand.ananda.data.api

import id.web.sipesand.ananda.AnandaApp
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    var baseUrl: String = "https://sipesand.web.id/"
    private val headerInterceptor = Interceptor { chain ->
        val b = chain.request().newBuilder()
            .addHeader("Accept","application/json")
            .addHeader("Content-Type","application/json")
        AnandaApp.token()?.let{ b.addHeader("Authorization","Bearer $it") }
        val slug = AnandaApp.tenantSlug(); if(slug.isNotBlank()) b.addHeader("X-Tenant-Subdomain", slug)
        val code = AnandaApp.tenantCode(); if(code.isNotBlank()) b.addHeader("X-Tenant-Code", code)
        chain.proceed(b.build())
    }
    private val log = HttpLoggingInterceptor().apply{ level = HttpLoggingInterceptor.Level.BODY }
    private val client = OkHttpClient.Builder()
        .addInterceptor(headerInterceptor).addInterceptor(log)
        .connectTimeout(15,TimeUnit.SECONDS).readTimeout(20,TimeUnit.SECONDS).writeTimeout(20,TimeUnit.SECONDS)
        .build()
    val api: ApiService by lazy{
        Retrofit.Builder().baseUrl(baseUrl).client(client).addConverterFactory(GsonConverterFactory.create()).build().create(ApiService::class.java)
    }
}
