package com.example.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.CartItem
import com.example.data.CategoryDto
import com.example.data.CreateOrderRequest
import com.example.data.OrderDto
import com.example.data.OrderItemInput
import com.example.data.ProductDto
import com.example.data.ProfileDto
import com.example.data.QuickBiteNetwork
import com.example.data.QuickBitePreferences
import com.example.data.SeedPreviewCatalog
import com.example.data.StoredConfig
import com.example.data.SupabaseAuthRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class QuickBiteUiState(
  val isLoading: Boolean = false,
  val isBackendConnected: Boolean = false,
  val isPreviewMode: Boolean = true,
  val config: StoredConfig = StoredConfig(),
  val categories: List<CategoryDto> = SeedPreviewCatalog.categories,
  val products: List<ProductDto> = SeedPreviewCatalog.products,
  val selectedCategorySlug: String = "all",
  val searchQuery: String = "",
  val vegOnly: Boolean = false,
  val cart: List<CartItem> = emptyList(),
  val profile: ProfileDto? = null,
  val orders: List<OrderDto> = emptyList(),
  val latestOrder: OrderDto? = null,
  val statusMessage: String? = null,
  val errorMessage: String? = null,
  val isSubmitting: Boolean = false,
) {
  val cartCount: Int
    get() = cart.sumOf { it.quantity }

  val subtotalInr: Double
    get() = cart.sumOf { it.product.priceInr * it.quantity }

  val deliveryFeeInr: Double
    get() = if (subtotalInr == 0.0 || subtotalInr >= 499.0) 0.0 else 40.0

  val taxInr: Double
    get() = Math.round(subtotalInr * 0.05 * 100.0) / 100.0

  val grandTotalInr: Double
    get() = Math.round((subtotalInr + deliveryFeeInr + taxInr) * 100.0) / 100.0
}

class QuickBiteViewModel(application: Application) : AndroidViewModel(application) {
  private val prefs = QuickBitePreferences(application.applicationContext)

  private val _uiState = MutableStateFlow(QuickBiteUiState())
  val uiState: StateFlow<QuickBiteUiState> = _uiState.asStateFlow()

  init {
    viewModelScope.launch {
      val initial = prefs.configFlow.first()
      _uiState.update { it.copy(config = initial) }
      if (initial.apiBaseUrl.isNotBlank()) {
        refreshFromBackend(initial)
      }
    }
  }

  fun clearMessages() {
    _uiState.update { it.copy(statusMessage = null, errorMessage = null) }
  }

  fun setCategoryFilter(slug: String) {
    _uiState.update { it.copy(selectedCategorySlug = slug) }
  }

  fun setSearchQuery(query: String) {
    _uiState.update { it.copy(searchQuery = query) }
  }

  fun toggleVegOnly() {
    _uiState.update { it.copy(vegOnly = !it.vegOnly) }
  }

  fun filteredProducts(): List<ProductDto> {
    val state = _uiState.value
    return state.products.filter { product ->
      val catMatch =
        state.selectedCategorySlug == "all" ||
          product.categories?.slug == state.selectedCategorySlug
      val vegMatch = !state.vegOnly || product.isVeg
      val q = state.searchQuery.trim().lowercase()
      val searchMatch =
        q.isEmpty() ||
          product.name.lowercase().contains(q) ||
          product.description.lowercase().contains(q)
      catMatch && vegMatch && searchMatch
    }
  }

  fun addToCart(product: ProductDto, quantity: Int = 1) {
    if (!product.isAvailable) {
      _uiState.update { it.copy(errorMessage = "${product.name} is currently unavailable.") }
      return
    }
    _uiState.update { state ->
      val existing = state.cart.find { it.product.id == product.id }
      val nextCart =
        if (existing != null) {
          state.cart.map {
            if (it.product.id == product.id) {
              it.copy(quantity = (it.quantity + quantity).coerceAtMost(50))
            } else {
              it
            }
          }
        } else {
          state.cart + CartItem(product = product, quantity = quantity.coerceIn(1, 50))
        }
      state.copy(cart = nextCart, statusMessage = "Added ${product.name} to cart")
    }
  }

  fun updateCartQuantity(productId: String, nextQty: Int) {
    _uiState.update { state ->
      val nextCart =
        if (nextQty <= 0) {
          state.cart.filterNot { it.product.id == productId }
        } else {
          state.cart.map {
            if (it.product.id == productId) it.copy(quantity = nextQty.coerceAtMost(50)) else it
          }
        }
      state.copy(cart = nextCart)
    }
  }

  fun clearCart() {
    _uiState.update { it.copy(cart = emptyList()) }
  }

  fun saveAndConnectBackend(apiUrl: String, supabaseUrl: String, anonKey: String) {
    if (apiUrl.isBlank()) {
      _uiState.update {
        it.copy(errorMessage = "Enter your QuickBite Express API URL (e.g. http://10.0.2.2:5000/api).")
      }
      return
    }
    viewModelScope.launch {
      prefs.saveServerConfig(apiUrl, supabaseUrl, anonKey)
      val updatedConfig = prefs.configFlow.first()
      _uiState.update { it.copy(config = updatedConfig) }
      refreshFromBackend(updatedConfig)
    }
  }

  fun refreshFromBackend(configOverride: StoredConfig? = null) {
    val cfg = configOverride ?: _uiState.value.config
    if (cfg.apiBaseUrl.isBlank()) {
      _uiState.update {
        it.copy(
          isBackendConnected = false,
          isPreviewMode = true,
          categories = SeedPreviewCatalog.categories,
          products = SeedPreviewCatalog.products,
        )
      }
      return
    }

    viewModelScope.launch {
      _uiState.update { it.copy(isLoading = true, errorMessage = null) }
      try {
        val api = QuickBiteNetwork.createApi(cfg.apiBaseUrl)
        val health = api.health()
        val catsRes = api.getCategories()
        val prodsRes = api.getProducts()

        var loadedProfile: ProfileDto? = null
        var loadedOrders: List<OrderDto> = emptyList()
        if (cfg.accessToken.isNotBlank()) {
          runCatching { api.getProfile("Bearer ${cfg.accessToken}").data }.onSuccess {
            loadedProfile = it
          }
          runCatching { api.getMyOrders("Bearer ${cfg.accessToken}").data }.onSuccess {
            loadedOrders = it ?: emptyList()
          }
        }

        _uiState.update {
          it.copy(
            isLoading = false,
            isBackendConnected = health.success,
            isPreviewMode = false,
            categories = catsRes.data ?: emptyList(),
            products = prodsRes.data ?: emptyList(),
            profile = loadedProfile,
            orders = loadedOrders,
            statusMessage = "Connected to QuickBite API",
          )
        }
      } catch (e: Exception) {
        _uiState.update {
          it.copy(
            isLoading = false,
            isBackendConnected = false,
            errorMessage = e.localizedMessage ?: "Failed to connect to backend.",
          )
        }
      }
    }
  }

  fun signInWithSupabase(email: String, password: String) {
    val cfg = _uiState.value.config
    if (cfg.supabaseUrl.isBlank() || cfg.supabaseAnonKey.isBlank()) {
      _uiState.update {
        it.copy(errorMessage = "Configure Supabase URL and Anon Key in the Connect tab first.")
      }
      return
    }

    viewModelScope.launch {
      _uiState.update { it.copy(isSubmitting = true, errorMessage = null) }
      try {
        val authApi = QuickBiteNetwork.createSupabaseAuth(cfg.supabaseUrl)
        val res = authApi.signIn(cfg.supabaseAnonKey, SupabaseAuthRequest(email.trim(), password))
        val body = res.body()
        val token = body?.accessToken
        if (res.isSuccessful && !token.isNullOrBlank()) {
          prefs.saveAccessToken(token)
          val nextCfg = cfg.copy(accessToken = token)
          _uiState.update { it.copy(config = nextCfg, isSubmitting = false) }
          refreshFromBackend(nextCfg)
        } else {
          _uiState.update {
            it.copy(
              isSubmitting = false,
              errorMessage = body?.errorDescription ?: body?.msg ?: "Invalid login credentials.",
            )
          }
        }
      } catch (e: Exception) {
        _uiState.update {
          it.copy(
            isSubmitting = false,
            errorMessage = e.localizedMessage ?: "Authentication failed.",
          )
        }
      }
    }
  }

  fun signOut() {
    viewModelScope.launch {
      prefs.saveAccessToken("")
      _uiState.update {
        it.copy(
          config = it.config.copy(accessToken = ""),
          profile = null,
          orders = emptyList(),
          statusMessage = "Signed out",
        )
      }
    }
  }

  fun placeOrder(
    customerName: String,
    customerPhone: String,
    deliveryAddress: String,
    paymentMethod: String,
    notes: String,
    onSuccess: (OrderDto) -> Unit,
  ) {
    val state = _uiState.value
    if (!state.isBackendConnected) {
      _uiState.update {
        it.copy(errorMessage = "Connect your Express API in the Connect tab before placing orders.")
      }
      return
    }
    if (state.config.accessToken.isBlank()) {
      _uiState.update {
        it.copy(errorMessage = "Sign in on the Connect tab before placing an order.")
      }
      return
    }
    if (state.cart.isEmpty()) {
      _uiState.update { it.copy(errorMessage = "Your cart is empty.") }
      return
    }

    viewModelScope.launch {
      _uiState.update { it.copy(isSubmitting = true, errorMessage = null) }
      try {
        val api = QuickBiteNetwork.createApi(state.config.apiBaseUrl)
        val response =
          api.placeOrder(
            bearer = "Bearer ${state.config.accessToken}",
            request =
              CreateOrderRequest(
                customerName = customerName.trim(),
                customerPhone = customerPhone.trim(),
                deliveryAddress = deliveryAddress.trim(),
                paymentMethod = paymentMethod,
                notes = notes.trim(),
                items = state.cart.map { OrderItemInput(it.product.id, it.quantity) },
              ),
          )
        val created = response.body()?.data
        if (response.isSuccessful && created != null) {
          _uiState.update {
            it.copy(
              isSubmitting = false,
              cart = emptyList(),
              latestOrder = created,
              orders = listOf(created) + it.orders,
              statusMessage = "Order ${created.orderNumber} confirmed!",
            )
          }
          onSuccess(created)
        } else {
          _uiState.update {
            it.copy(
              isSubmitting = false,
              errorMessage = response.body()?.error ?: "Order failed (${response.code()}).",
            )
          }
        }
      } catch (e: Exception) {
        _uiState.update {
          it.copy(isSubmitting = false, errorMessage = e.localizedMessage ?: "Order failed.")
        }
      }
    }
  }
}
