package com.example.data

import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Query
import java.util.concurrent.TimeUnit

interface QuickBiteApi {
  @GET("health")
  suspend fun health(): ApiResponse<HealthData>

  @GET("categories")
  suspend fun getCategories(): ApiResponse<List<CategoryDto>>

  @GET("products")
  suspend fun getProducts(
    @Query("category") category: String? = null,
    @Query("search") search: String? = null,
    @Query("veg") veg: String? = null,
  ): ApiResponse<List<ProductDto>>

  @GET("profile")
  suspend fun getProfile(
    @Header("Authorization") bearer: String,
  ): ApiResponse<ProfileDto>

  @POST("orders")
  suspend fun placeOrder(
    @Header("Authorization") bearer: String,
    @Body request: CreateOrderRequest,
  ): Response<ApiResponse<OrderDto>>

  @GET("orders/my")
  suspend fun getMyOrders(
    @Header("Authorization") bearer: String,
  ): ApiResponse<List<OrderDto>>
}

interface SupabaseAuthApi {
  @POST("auth/v1/token?grant_type=password")
  suspend fun signIn(
    @Header("apikey") anonKey: String,
    @Body body: SupabaseAuthRequest,
  ): Response<SupabaseAuthResponse>

  @POST("auth/v1/signup")
  suspend fun signUp(
    @Header("apikey") anonKey: String,
    @Body body: SupabaseAuthRequest,
  ): Response<SupabaseAuthResponse>
}

object QuickBiteNetwork {
  val moshi: Moshi = Moshi.Builder().addLast(KotlinJsonAdapterFactory()).build()

  private val okHttp: OkHttpClient =
    OkHttpClient.Builder()
      .connectTimeout(12, TimeUnit.SECONDS)
      .readTimeout(20, TimeUnit.SECONDS)
      .addInterceptor(
        HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BASIC }
      )
      .build()

  fun createApi(baseUrl: String): QuickBiteApi {
    val normalized = baseUrl.trim().trimEnd('/') + "/"
    return Retrofit.Builder()
      .baseUrl(normalized)
      .client(okHttp)
      .addConverterFactory(MoshiConverterFactory.create(moshi))
      .build()
      .create(QuickBiteApi::class.java)
  }

  fun createSupabaseAuth(supabaseUrl: String): SupabaseAuthApi {
    val normalized = supabaseUrl.trim().trimEnd('/') + "/"
    return Retrofit.Builder()
      .baseUrl(normalized)
      .client(okHttp)
      .addConverterFactory(MoshiConverterFactory.create(moshi))
      .build()
      .create(SupabaseAuthApi::class.java)
  }
}
