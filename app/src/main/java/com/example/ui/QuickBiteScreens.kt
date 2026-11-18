package com.example.ui

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.RestaurantMenu
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.minimumInteractiveComponentSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.example.R
import com.example.data.ProductDto
import com.example.ui.theme.NonVegRed
import com.example.ui.theme.VegGreen
import java.text.NumberFormat
import java.util.Locale

private enum class QuickBiteTab(val label: String) {
  HOME("Home"),
  MENU("Menu"),
  CART("Cart"),
  ORDERS("Orders"),
  CONNECT("Connect"),
}

private fun formatInr(amount: Double): String {
  val formatter = NumberFormat.getCurrencyInstance(Locale("en", "IN"))
  formatter.maximumFractionDigits = if (amount % 1.0 == 0.0) 0 else 2
  return formatter.format(amount)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickBiteApp(viewModel: QuickBiteViewModel) {
  val state by viewModel.uiState.collectAsStateWithLifecycle()
  var currentTab by remember { mutableStateOf(QuickBiteTab.HOME) }
  var selectedProduct by remember { mutableStateOf<ProductDto?>(null) }
  val snackbarHostState = remember { SnackbarHostState() }

  LaunchedEffect(state.statusMessage, state.errorMessage) {
    val msg = state.errorMessage ?: state.statusMessage
    if (!msg.isNullOrBlank()) {
      snackbarHostState.showSnackbar(msg)
      viewModel.clearMessages()
    }
  }

  Scaffold(
    snackbarHost = { SnackbarHost(snackbarHostState) },
    bottomBar = {
      NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
        QuickBiteTab.entries.forEach { tab ->
          val icon =
            when (tab) {
              QuickBiteTab.HOME -> Icons.Default.Home
              QuickBiteTab.MENU -> Icons.Default.RestaurantMenu
              QuickBiteTab.CART -> Icons.Default.ShoppingBag
              QuickBiteTab.ORDERS -> Icons.Default.ReceiptLong
              QuickBiteTab.CONNECT -> Icons.Default.Settings
            }
          NavigationBarItem(
            selected = currentTab == tab,
            onClick = { currentTab = tab },
            modifier = Modifier.testTag("nav_${tab.name.lowercase()}"),
            icon = {
              if (tab == QuickBiteTab.CART && state.cartCount > 0) {
                BadgedBox(badge = { Badge { Text("${state.cartCount}") } }) {
                  Icon(icon, contentDescription = tab.label)
                }
              } else {
                Icon(icon, contentDescription = tab.label)
              }
            },
            label = { Text(tab.label) },
          )
        }
      }
    },
  ) { innerPadding ->
    Box(
      modifier =
        Modifier.fillMaxSize()
          .background(MaterialTheme.colorScheme.background)
          .padding(innerPadding)
    ) {
      when (currentTab) {
        QuickBiteTab.HOME ->
          HomeScreen(
            state = state,
            onBrowseMenu = { currentTab = QuickBiteTab.MENU },
            onSelectCategory = { slug ->
              viewModel.setCategoryFilter(slug)
              currentTab = QuickBiteTab.MENU
            },
            onOpenProduct = { selectedProduct = it },
            onAddToCart = { viewModel.addToCart(it, 1) },
            onOpenConnect = { currentTab = QuickBiteTab.CONNECT },
          )
        QuickBiteTab.MENU ->
          MenuScreen(
            state = state,
            products = viewModel.filteredProducts(),
            onCategorySelected = viewModel::setCategoryFilter,
            onSearchChange = viewModel::setSearchQuery,
            onToggleVeg = viewModel::toggleVegOnly,
            onOpenProduct = { selectedProduct = it },
            onAddToCart = { viewModel.addToCart(it, 1) },
          )
        QuickBiteTab.CART ->
          CartCheckoutScreen(
            state = state,
            onUpdateQty = viewModel::updateCartQuantity,
            onPlaceOrder = { name, phone, address, payMethod, notes ->
              viewModel.placeOrder(name, phone, address, payMethod, notes) {
                currentTab = QuickBiteTab.ORDERS
              }
            },
            onOpenConnect = { currentTab = QuickBiteTab.CONNECT },
            onBrowseMenu = { currentTab = QuickBiteTab.MENU },
          )
        QuickBiteTab.ORDERS ->
          OrdersScreen(
            state = state,
            onRefresh = { viewModel.refreshFromBackend() },
            onOpenConnect = { currentTab = QuickBiteTab.CONNECT },
          )
        QuickBiteTab.CONNECT ->
          ConnectScreen(
            state = state,
            onSaveConfig = viewModel::saveAndConnectBackend,
            onSignIn = viewModel::signInWithSupabase,
            onSignOut = viewModel::signOut,
          )
      }
    }
  }

  selectedProduct?.let { product ->
    var detailQty by remember(product.id) { mutableIntStateOf(1) }
    ModalBottomSheet(onDismissRequest = { selectedProduct = null }) {
      Column(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
      ) {
        AsyncImage(
          model = product.imageUrl,
          contentDescription = product.name,
          contentScale = ContentScale.Crop,
          modifier = Modifier.fillMaxWidth().height(190.dp).clip(RoundedCornerShape(16.dp)),
        )
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
          VegIndicator(product.isVeg)
          Text(
            text = product.categories?.name ?: "QuickBite Special",
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.primary,
          )
        }
        Text(text = product.name, style = MaterialTheme.typography.titleLarge)
        Text(
          text = product.description,
          style = MaterialTheme.typography.bodyMedium,
          color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically,
        ) {
          Text(
            text = formatInr(product.priceInr),
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.primary,
          )
          Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(
              onClick = { if (detailQty > 1) detailQty-- },
              modifier = Modifier.minimumInteractiveComponentSize().testTag("detail_minus"),
            ) {
              Icon(Icons.Default.Remove, contentDescription = "Decrease quantity")
            }
            Text(text = "$detailQty", style = MaterialTheme.typography.titleMedium)
            IconButton(
              onClick = { if (detailQty < 50) detailQty++ },
              modifier = Modifier.minimumInteractiveComponentSize().testTag("detail_plus"),
            ) {
              Icon(Icons.Default.Add, contentDescription = "Increase quantity")
            }
          }
        }
        Button(
          onClick = {
            viewModel.addToCart(product, detailQty)
            selectedProduct = null
          },
          enabled = product.isAvailable,
          modifier = Modifier.fillMaxWidth().height(52.dp).testTag("detail_add_to_cart"),
        ) {
          Text(
            if (product.isAvailable) "Add to Cart • ${formatInr(product.priceInr * detailQty)}"
            else "Currently Unavailable"
          )
        }
        Spacer(modifier = Modifier.height(16.dp))
      }
    }
  }
}

@Composable
private fun ConnectionBanner(state: QuickBiteUiState, onOpenConnect: () -> Unit) {
  Card(
    colors =
      CardDefaults.cardColors(
        containerColor =
          if (state.isBackendConnected) MaterialTheme.colorScheme.primaryContainer
          else MaterialTheme.colorScheme.surfaceVariant
      ),
    shape = RoundedCornerShape(16.dp),
    modifier = Modifier.fillMaxWidth(),
  ) {
    Row(
      modifier = Modifier.fillMaxWidth().padding(14.dp),
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
      Icon(
        imageVector = if (state.isBackendConnected) Icons.Default.CloudDone else Icons.Default.CloudOff,
        contentDescription = "Backend connection status",
        tint = MaterialTheme.colorScheme.primary,
      )
      Column(modifier = Modifier.weight(1f)) {
        Text(
          text =
            if (state.isBackendConnected) "Live Backend Connected"
            else "Seed Preview Mode (Offline)",
          style = MaterialTheme.typography.titleMedium,
        )
        Text(
          text =
            if (state.isBackendConnected) "Syncing menu & orders from Express API"
            else "Connect your Express API URL to place real orders.",
          style = MaterialTheme.typography.bodyMedium,
          color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
      }
      OutlinedButton(
        onClick = onOpenConnect,
        modifier = Modifier.minimumInteractiveComponentSize().testTag("banner_connect_btn"),
      ) {
        Text(if (state.isBackendConnected) "Account" else "Setup")
      }
    }
  }
}

@Composable
private fun HomeScreen(
  state: QuickBiteUiState,
  onBrowseMenu: () -> Unit,
  onSelectCategory: (String) -> Unit,
  onOpenProduct: (ProductDto) -> Unit,
  onAddToCart: (ProductDto) -> Unit,
  onOpenConnect: () -> Unit,
) {
  LazyColumn(
    contentPadding = PaddingValues(16.dp),
    verticalArrangement = Arrangement.spacedBy(18.dp),
  ) {
    item {
      Box(
        modifier = Modifier.fillMaxWidth().height(210.dp).clip(RoundedCornerShape(24.dp))
      ) {
        Image(
          painter = painterResource(id = R.drawable.img_hero_banner),
          contentDescription = "QuickBite fresh food feast",
          contentScale = ContentScale.Crop,
          modifier = Modifier.fillMaxSize(),
        )
        Box(
          modifier =
            Modifier.fillMaxSize()
              .background(
                Brush.verticalGradient(
                  listOf(Color.Black.copy(alpha = 0.18f), Color.Black.copy(alpha = 0.78f))
                )
              )
        )
        Column(
          modifier = Modifier.align(Alignment.BottomStart).padding(18.dp),
          verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
          Text(
            text = "QuickBite",
            style = MaterialTheme.typography.displaySmall,
            color = Color.White,
          )
          Text(
            text = "Hot biriyani, artisan pizza & South Indian classics delivered fast.",
            style = MaterialTheme.typography.bodyMedium,
            color = Color.White.copy(alpha = 0.9f),
          )
          Button(
            onClick = onBrowseMenu,
            modifier = Modifier.padding(top = 4.dp).testTag("hero_browse_btn"),
          ) {
            Text("Explore Menu")
          }
        }
      }
    }

    item { ConnectionBanner(state = state, onOpenConnect = onOpenConnect) }

    item {
      Text(text = "Browse Cuisines", style = MaterialTheme.typography.titleLarge)
      Spacer(modifier = Modifier.height(10.dp))
      Row(
        modifier = Modifier.horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
      ) {
        state.categories.forEach { cat ->
          FilterChip(
            selected = false,
            onClick = { onSelectCategory(cat.slug) },
            label = { Text(cat.name) },
            modifier = Modifier.testTag("home_cat_${cat.slug}"),
          )
        }
      }
    }

    item {
      Text(
        text = if (state.isPreviewMode) "Featured Dishes (Seed Preview)" else "Featured Dishes",
        style = MaterialTheme.typography.titleLarge,
      )
    }

    items(state.products.take(6), key = { it.id }) { product ->
      DishRowCard(
        product = product,
        onClick = { onOpenProduct(product) },
        onAdd = { onAddToCart(product) },
      )
    }
  }
}

@Composable
private fun MenuScreen(
  state: QuickBiteUiState,
  products: List<ProductDto>,
  onCategorySelected: (String) -> Unit,
  onSearchChange: (String) -> Unit,
  onToggleVeg: () -> Unit,
  onOpenProduct: (ProductDto) -> Unit,
  onAddToCart: (ProductDto) -> Unit,
) {
  Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
    Text(text = "Menu", style = MaterialTheme.typography.headlineMedium)

    OutlinedTextField(
      value = state.searchQuery,
      onValueChange = onSearchChange,
      leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search dishes") },
      placeholder = { Text("Search biriyani, pizza, dosa...") },
      singleLine = true,
      shape = RoundedCornerShape(14.dp),
      modifier = Modifier.fillMaxWidth().testTag("menu_search_input"),
    )

    Row(
      modifier = Modifier.horizontalScroll(rememberScrollState()),
      horizontalArrangement = Arrangement.spacedBy(8.dp),
      verticalAlignment = Alignment.CenterVertically,
    ) {
      FilterChip(
        selected = state.vegOnly,
        onClick = onToggleVeg,
        label = { Text("Pure Veg") },
        colors = FilterChipDefaults.filterChipColors(selectedContainerColor = VegGreen.copy(alpha = 0.16f)),
        modifier = Modifier.testTag("menu_veg_filter"),
      )
      FilterChip(
        selected = state.selectedCategorySlug == "all",
        onClick = { onCategorySelected("all") },
        label = { Text("All") },
      )
      state.categories.forEach { cat ->
        FilterChip(
          selected = state.selectedCategorySlug == cat.slug,
          onClick = { onCategorySelected(cat.slug) },
          label = { Text(cat.name) },
        )
      }
    }

    if (products.isEmpty()) {
      Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text(
          text = "No dishes match your filter.",
          style = MaterialTheme.typography.bodyLarge,
          color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
      }
    } else {
      LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        items(products, key = { it.id }) { product ->
          DishRowCard(
            product = product,
            onClick = { onOpenProduct(product) },
            onAdd = { onAddToCart(product) },
          )
        }
      }
    }
  }
}

@Composable
private fun DishRowCard(
  product: ProductDto,
  onClick: () -> Unit,
  onAdd: () -> Unit,
) {
  Card(
    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    shape = RoundedCornerShape(18.dp),
    modifier = Modifier.fillMaxWidth().clickable(onClick = onClick).testTag("dish_card_${product.id}"),
  ) {
    Row(
      modifier = Modifier.fillMaxWidth().padding(12.dp),
      horizontalArrangement = Arrangement.spacedBy(12.dp),
      verticalAlignment = Alignment.CenterVertically,
    ) {
      AsyncImage(
        model = product.imageUrl,
        contentDescription = product.name,
        contentScale = ContentScale.Crop,
        modifier = Modifier.size(92.dp).clip(RoundedCornerShape(14.dp)),
      )
      Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
          VegIndicator(product.isVeg)
          Icon(
            Icons.Default.Star,
            contentDescription = "Rating",
            tint = MaterialTheme.colorScheme.tertiary,
            modifier = Modifier.size(14.dp),
          )
          Text(text = "${product.rating}", style = MaterialTheme.typography.labelMedium)
        }
        Text(
          text = product.name,
          style = MaterialTheme.typography.titleMedium,
          maxLines = 1,
          overflow = TextOverflow.Ellipsis,
        )
        Text(
          text = product.description,
          style = MaterialTheme.typography.bodyMedium,
          color = MaterialTheme.colorScheme.onSurfaceVariant,
          maxLines = 2,
          overflow = TextOverflow.Ellipsis,
        )
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically,
        ) {
          Text(
            text = formatInr(product.priceInr),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
          )
          Button(
            onClick = onAdd,
            enabled = product.isAvailable,
            contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
            modifier = Modifier.minimumInteractiveComponentSize().testTag("add_btn_${product.id}"),
          ) {
            Text(if (product.isAvailable) "+ Add" else "Sold Out")
          }
        }
      }
    }
  }
}

@Composable
private fun VegIndicator(isVeg: Boolean) {
  val color = if (isVeg) VegGreen else NonVegRed
  Box(
    modifier = Modifier.size(14.dp).border(1.5.dp, color, RoundedCornerShape(3.dp)),
    contentAlignment = Alignment.Center,
  ) {
    Box(modifier = Modifier.size(7.dp).background(color, CircleShape))
  }
}

@Composable
private fun CartCheckoutScreen(
  state: QuickBiteUiState,
  onUpdateQty: (String, Int) -> Unit,
  onPlaceOrder: (String, String, String, String, String) -> Unit,
  onOpenConnect: () -> Unit,
  onBrowseMenu: () -> Unit,
) {
  var name by remember { mutableStateOf(state.profile?.fullName ?: "") }
  var phone by remember { mutableStateOf(state.profile?.phone ?: "") }
  var address by remember { mutableStateOf("") }
  var notes by remember { mutableStateOf("") }
  var paymentMethod by remember { mutableStateOf("cod") }

  if (state.cart.isEmpty()) {
    Column(
      modifier = Modifier.fillMaxSize().padding(24.dp),
      verticalArrangement = Arrangement.Center,
      horizontalAlignment = Alignment.CenterHorizontally,
    ) {
      Icon(
        Icons.Default.ShoppingBag,
        contentDescription = "Empty cart",
        tint = MaterialTheme.colorScheme.primary,
        modifier = Modifier.size(56.dp),
      )
      Spacer(modifier = Modifier.height(12.dp))
      Text("Your cart is empty", style = MaterialTheme.typography.titleLarge)
      Spacer(modifier = Modifier.height(6.dp))
      Text(
        "Add dishes from the menu to place an order.",
        style = MaterialTheme.typography.bodyMedium,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
      )
      Spacer(modifier = Modifier.height(16.dp))
      Button(onClick = onBrowseMenu, modifier = Modifier.testTag("empty_cart_browse")) {
        Text("Browse Menu")
      }
    }
    return
  }

  Column(
    modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
    verticalArrangement = Arrangement.spacedBy(14.dp),
  ) {
    Text("Cart & Checkout", style = MaterialTheme.typography.headlineMedium)

    state.cart.forEach { item ->
      Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(16.dp),
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(12.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
          Column(modifier = Modifier.weight(1f)) {
            Text(item.product.name, style = MaterialTheme.typography.titleMedium)
            Text(
              "${formatInr(item.product.priceInr)} each",
              style = MaterialTheme.typography.bodyMedium,
              color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
          }
          IconButton(
            onClick = { onUpdateQty(item.product.id, item.quantity - 1) },
            modifier = Modifier.minimumInteractiveComponentSize(),
          ) {
            Icon(
              if (item.quantity == 1) Icons.Default.Delete else Icons.Default.Remove,
              contentDescription = "Decrease quantity",
            )
          }
          Text("${item.quantity}", style = MaterialTheme.typography.titleMedium)
          IconButton(
            onClick = { onUpdateQty(item.product.id, item.quantity + 1) },
            modifier = Modifier.minimumInteractiveComponentSize(),
          ) {
            Icon(Icons.Default.Add, contentDescription = "Increase quantity")
          }
        }
      }
    }

    Card(
      colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
      shape = RoundedCornerShape(16.dp),
    ) {
      Column(modifier = Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text("Bill Summary", style = MaterialTheme.typography.titleMedium)
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
          Text("Subtotal")
          Text(formatInr(state.subtotalInr))
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
          Text("Delivery Fee")
          Text(if (state.deliveryFeeInr == 0.0) "FREE" else formatInr(state.deliveryFeeInr))
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
          Text("Taxes (5% GST)")
          Text(formatInr(state.taxInr))
        }
        HorizontalDivider()
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
          Text("Grand Total", fontWeight = FontWeight.Bold)
          Text(
            formatInr(state.grandTotalInr),
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary,
          )
        }
      }
    }

    if (!state.isBackendConnected || state.config.accessToken.isBlank()) {
      Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
        shape = RoundedCornerShape(16.dp),
      ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text("Backend & Sign-In Required to Order", style = MaterialTheme.typography.titleMedium)
          Text(
            "QuickBite verifies menu prices and saves orders on your Express + Supabase backend (never faked locally). Connect your server and sign in first.",
            style = MaterialTheme.typography.bodyMedium,
          )
          Button(onClick = onOpenConnect, modifier = Modifier.testTag("checkout_open_connect")) {
            Text("Go to Connect & Sign In")
          }
        }
      }
    } else {
      OutlinedTextField(
        value = name,
        onValueChange = { name = it },
        label = { Text("Customer Name") },
        modifier = Modifier.fillMaxWidth().testTag("checkout_name"),
      )
      OutlinedTextField(
        value = phone,
        onValueChange = { phone = it },
        label = { Text("Phone Number") },
        modifier = Modifier.fillMaxWidth().testTag("checkout_phone"),
      )
      OutlinedTextField(
        value = address,
        onValueChange = { address = it },
        label = { Text("Full Delivery Address") },
        minLines = 2,
        modifier = Modifier.fillMaxWidth().testTag("checkout_address"),
      )
      OutlinedTextField(
        value = notes,
        onValueChange = { notes = it },
        label = { Text("Delivery Instructions (Optional)") },
        modifier = Modifier.fillMaxWidth(),
      )

      Text("Payment Method", style = MaterialTheme.typography.titleMedium)
      Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        listOf("cod" to "Cash on Delivery", "demo_upi" to "Demo UPI (Simulated)").forEach {
          (id, label) ->
          FilterChip(
            selected = paymentMethod == id,
            onClick = { paymentMethod = id },
            label = { Text(label) },
          )
        }
      }

      Button(
        onClick = { onPlaceOrder(name, phone, address, paymentMethod, notes) },
        enabled = !state.isSubmitting,
        modifier = Modifier.fillMaxWidth().height(52.dp).testTag("place_order_btn"),
      ) {
        Text(if (state.isSubmitting) "Placing Order..." else "Place Order • ${formatInr(state.grandTotalInr)}")
      }
    }
  }
}

@Composable
private fun OrdersScreen(
  state: QuickBiteUiState,
  onRefresh: () -> Unit,
  onOpenConnect: () -> Unit,
) {
  Column(modifier = Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically,
    ) {
      Text("My Orders", style = MaterialTheme.typography.headlineMedium)
      OutlinedButton(onClick = onRefresh, modifier = Modifier.testTag("orders_refresh_btn")) {
        Text("Refresh")
      }
    }

    if (!state.isBackendConnected || state.config.accessToken.isBlank()) {
      Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        shape = RoundedCornerShape(16.dp),
      ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text("Connect & Sign In to View Order History", style = MaterialTheme.typography.titleMedium)
          Text(
            "Orders are stored securely in Supabase PostgreSQL per authenticated customer.",
            style = MaterialTheme.typography.bodyMedium,
          )
          Button(onClick = onOpenConnect) { Text("Open Connect Tab") }
        }
      }
    } else if (state.orders.isEmpty()) {
      Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("No orders placed yet.", color = MaterialTheme.colorScheme.onSurfaceVariant)
      }
    } else {
      LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        items(state.orders, key = { it.id }) { order ->
          Card(
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(16.dp),
          ) {
            Column(modifier = Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
              Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(order.orderNumber, style = MaterialTheme.typography.titleMedium)
                Surface(
                  color = MaterialTheme.colorScheme.primaryContainer,
                  shape = RoundedCornerShape(8.dp),
                ) {
                  Text(
                    order.status,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                  )
                }
              }
              order.orderItems.forEach { item ->
                Text(
                  "${item.quantity}x ${item.productNameSnapshot} (${formatInr(item.lineTotalInr)})",
                  style = MaterialTheme.typography.bodyMedium,
                )
              }
              Text(
                "Total: ${formatInr(order.totalInr)}",
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary,
              )
            }
          }
        }
      }
    }
  }
}

@Composable
private fun ConnectScreen(
  state: QuickBiteUiState,
  onSaveConfig: (String, String, String) -> Unit,
  onSignIn: (String, String) -> Unit,
  onSignOut: () -> Unit,
) {
  var apiUrl by remember(state.config.apiBaseUrl) {
    mutableStateOf(state.config.apiBaseUrl.ifBlank { "http://10.0.2.2:5000/api" })
  }
  var supabaseUrl by remember(state.config.supabaseUrl) { mutableStateOf(state.config.supabaseUrl) }
  var anonKey by remember(state.config.supabaseAnonKey) { mutableStateOf(state.config.supabaseAnonKey) }
  var email by remember { mutableStateOf("") }
  var password by remember { mutableStateOf("") }

  Column(
    modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
    verticalArrangement = Arrangement.spacedBy(14.dp),
  ) {
    Text("Backend & Auth Setup", style = MaterialTheme.typography.headlineMedium)

    Card(
      colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
      shape = RoundedCornerShape(16.dp),
    ) {
      Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("1. Express API & Supabase Config", style = MaterialTheme.typography.titleMedium)
        OutlinedTextField(
          value = apiUrl,
          onValueChange = { apiUrl = it },
          label = { Text("Express API URL") },
          placeholder = { Text("http://10.0.2.2:5000/api or https://your-api.onrender.com/api") },
          singleLine = true,
          modifier = Modifier.fillMaxWidth().testTag("connect_api_url"),
        )
        OutlinedTextField(
          value = supabaseUrl,
          onValueChange = { supabaseUrl = it },
          label = { Text("Supabase Project URL") },
          singleLine = true,
          modifier = Modifier.fillMaxWidth().testTag("connect_supabase_url"),
        )
        OutlinedTextField(
          value = anonKey,
          onValueChange = { anonKey = it },
          label = { Text("Supabase Anon Key") },
          singleLine = true,
          modifier = Modifier.fillMaxWidth().testTag("connect_anon_key"),
        )
        Button(
          onClick = { onSaveConfig(apiUrl, supabaseUrl, anonKey) },
          modifier = Modifier.fillMaxWidth().testTag("connect_save_btn"),
        ) {
          Text("Save & Connect")
        }
      }
    }

    Card(
      colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
      shape = RoundedCornerShape(16.dp),
    ) {
      Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("2. Customer / Admin Sign In", style = MaterialTheme.typography.titleMedium)
        if (state.config.accessToken.isNotBlank()) {
          Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Icon(Icons.Default.CheckCircle, contentDescription = "Signed in", tint = VegGreen)
            Text(
              "Signed in as ${state.profile?.email ?: "Authenticated User"} (${state.profile?.role ?: "customer"})",
              style = MaterialTheme.typography.bodyMedium,
            )
          }
          OutlinedButton(
            onClick = onSignOut,
            colors = ButtonDefaults.outlinedButtonColors(contentColor = NonVegRed),
          ) {
            Text("Sign Out")
          }
        } else {
          OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth().testTag("auth_email"),
          )
          OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            visualTransformation = PasswordVisualTransformation(),
            singleLine = true,
            modifier = Modifier.fillMaxWidth().testTag("auth_password"),
          )
          Button(
            onClick = { onSignIn(email, password) },
            enabled = !state.isSubmitting,
            modifier = Modifier.fillMaxWidth().testTag("auth_signin_btn"),
          ) {
            Text(if (state.isSubmitting) "Signing In..." else "Sign In via Supabase Auth")
          }
        }
      }
    }
  }
}
