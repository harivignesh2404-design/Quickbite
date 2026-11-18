package com.example.data

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class ApiResponse<T>(
  val success: Boolean = false,
  val data: T? = null,
  val error: String? = null,
)

@JsonClass(generateAdapter = true)
data class HealthData(
  val service: String = "",
  val supabaseConfigured: Boolean = false,
)

@JsonClass(generateAdapter = true)
data class CategoryDto(
  val id: String,
  val name: String,
  val slug: String,
  val description: String = "",
  @Json(name = "image_url") val imageUrl: String = "",
  @Json(name = "sort_order") val sortOrder: Int = 0,
  @Json(name = "is_active") val isActive: Boolean = true,
)

@JsonClass(generateAdapter = true)
data class ProductCategoryRef(
  val id: String = "",
  val name: String = "",
  val slug: String = "",
)

@JsonClass(generateAdapter = true)
data class ProductDto(
  val id: String,
  @Json(name = "category_id") val categoryId: String = "",
  val name: String,
  val slug: String = "",
  val description: String = "",
  @Json(name = "price_inr") val priceInr: Double,
  @Json(name = "image_url") val imageUrl: String = "",
  @Json(name = "is_veg") val isVeg: Boolean = true,
  @Json(name = "is_available") val isAvailable: Boolean = true,
  @Json(name = "is_featured") val isFeatured: Boolean = false,
  @Json(name = "is_popular") val isPopular: Boolean = false,
  @Json(name = "prep_time_mins") val prepTimeMins: Int = 25,
  val rating: Double = 4.5,
  val categories: ProductCategoryRef? = null,
)

@JsonClass(generateAdapter = true)
data class CartItem(
  val product: ProductDto,
  val quantity: Int,
)

@JsonClass(generateAdapter = true)
data class OrderItemInput(
  @Json(name = "product_id") val productId: String,
  val quantity: Int,
)

@JsonClass(generateAdapter = true)
data class CreateOrderRequest(
  @Json(name = "customer_name") val customerName: String,
  @Json(name = "customer_phone") val customerPhone: String,
  @Json(name = "delivery_address") val deliveryAddress: String,
  @Json(name = "payment_method") val paymentMethod: String,
  val notes: String = "",
  val items: List<OrderItemInput>,
)

@JsonClass(generateAdapter = true)
data class OrderItemDto(
  val id: String = "",
  @Json(name = "product_name_snapshot") val productNameSnapshot: String = "",
  @Json(name = "unit_price_inr_snapshot") val unitPriceInrSnapshot: Double = 0.0,
  val quantity: Int = 1,
  @Json(name = "line_total_inr") val lineTotalInr: Double = 0.0,
)

@JsonClass(generateAdapter = true)
data class OrderDto(
  val id: String,
  @Json(name = "order_number") val orderNumber: String,
  @Json(name = "customer_name") val customerName: String = "",
  @Json(name = "customer_phone") val customerPhone: String = "",
  @Json(name = "delivery_address") val deliveryAddress: String = "",
  @Json(name = "payment_method") val paymentMethod: String = "cod",
  @Json(name = "is_demo_payment") val isDemoPayment: Boolean = false,
  @Json(name = "subtotal_inr") val subtotalInr: Double = 0.0,
  @Json(name = "delivery_fee_inr") val deliveryFeeInr: Double = 0.0,
  @Json(name = "tax_inr") val taxInr: Double = 0.0,
  @Json(name = "total_inr") val totalInr: Double = 0.0,
  val status: String = "Pending",
  @Json(name = "created_at") val createdAt: String = "",
  @Json(name = "order_items") val orderItems: List<OrderItemDto> = emptyList(),
)

@JsonClass(generateAdapter = true)
data class ProfileDto(
  val id: String = "",
  @Json(name = "full_name") val fullName: String = "",
  val email: String = "",
  val phone: String = "",
  val role: String = "customer",
)

@JsonClass(generateAdapter = true)
data class SupabaseAuthRequest(
  val email: String,
  val password: String,
)

@JsonClass(generateAdapter = true)
data class SupabaseAuthResponse(
  @Json(name = "access_token") val accessToken: String? = null,
  val error: String? = null,
  @Json(name = "error_description") val errorDescription: String? = null,
  val msg: String? = null,
)

/**
 * Clearly marked Seed / Demo preview catalog displayed ONLY when the backend API
 * has not yet been connected by the user. Checkout requires a live backend connection.
 */
object SeedPreviewCatalog {
  val categories =
    listOf(
      CategoryDto(id = "cat-biriyani", name = "Biriyani", slug = "biriyani", sortOrder = 1),
      CategoryDto(id = "cat-pizza", name = "Pizza", slug = "pizza", sortOrder = 2),
      CategoryDto(id = "cat-burgers", name = "Burgers", slug = "burgers", sortOrder = 3),
      CategoryDto(id = "cat-south", name = "South Indian", slug = "south-indian", sortOrder = 4),
      CategoryDto(id = "cat-chinese", name = "Chinese", slug = "chinese", sortOrder = 5),
      CategoryDto(id = "cat-desserts", name = "Desserts", slug = "desserts", sortOrder = 6),
      CategoryDto(id = "cat-beverages", name = "Beverages", slug = "beverages", sortOrder = 7),
    )

  val products =
    listOf(
      ProductDto(
        id = "seed-1",
        categoryId = "cat-biriyani",
        name = "Hyderabadi Chicken Dum Biriyani [Seed]",
        description = "Saffron basmati rice dum-cooked with spiced chicken, mint, and raita.",
        priceInr = 329.0,
        imageUrl = "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
        isVeg = false,
        isFeatured = true,
        isPopular = true,
        prepTimeMins = 30,
        rating = 4.8,
        categories = ProductCategoryRef("cat-biriyani", "Biriyani", "biriyani"),
      ),
      ProductDto(
        id = "seed-2",
        categoryId = "cat-pizza",
        name = "Smoky Tandoori Paneer Pizza [Seed]",
        description = "Hand-tossed crust with tandoori paneer, peppers, and molten mozzarella.",
        priceInr = 349.0,
        imageUrl = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
        isVeg = true,
        isFeatured = true,
        isPopular = true,
        prepTimeMins = 22,
        rating = 4.7,
        categories = ProductCategoryRef("cat-pizza", "Pizza", "pizza"),
      ),
      ProductDto(
        id = "seed-3",
        categoryId = "cat-south",
        name = "Ghee Roast Masala Dosa [Seed]",
        description = "Crisp fermented crepe roasted in pure ghee with potato masala and sambar.",
        priceInr = 149.0,
        imageUrl = "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80",
        isVeg = true,
        isFeatured = true,
        isPopular = true,
        prepTimeMins = 15,
        rating = 4.8,
        categories = ProductCategoryRef("cat-south", "South Indian", "south-indian"),
      ),
      ProductDto(
        id = "seed-4",
        categoryId = "cat-burgers",
        name = "Double Smash Cheese Burger [Seed]",
        description = "Two seared smash patties, melted cheddar, and smoky chipotle mayo.",
        priceInr = 259.0,
        imageUrl = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        isVeg = false,
        isFeatured = true,
        isPopular = true,
        prepTimeMins = 18,
        rating = 4.7,
        categories = ProductCategoryRef("cat-burgers", "Burgers", "burgers"),
      ),
      ProductDto(
        id = "seed-5",
        categoryId = "cat-desserts",
        name = "Warm Gulab Jamun with Rabri [Seed]",
        description = "Khoya dumplings in rose cardamom syrup over chilled saffron rabri.",
        priceInr = 129.0,
        imageUrl = "https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?auto=format&fit=crop&w=800&q=80",
        isVeg = true,
        isFeatured = true,
        isPopular = true,
        prepTimeMins = 10,
        rating = 4.9,
        categories = ProductCategoryRef("cat-desserts", "Desserts", "desserts"),
      ),
      ProductDto(
        id = "seed-6",
        categoryId = "cat-beverages",
        name = "Belgian Hazelnut Cold Coffee [Seed]",
        description = "Double espresso blended silky smooth with chilled milk and hazelnut.",
        priceInr = 139.0,
        imageUrl = "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80",
        isVeg = true,
        isFeatured = true,
        isPopular = true,
        prepTimeMins = 8,
        rating = 4.7,
        categories = ProductCategoryRef("cat-beverages", "Beverages", "beverages"),
      ),
    )
}
