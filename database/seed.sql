-- =============================================================================
-- QuickBite Seed / Demo Data (INR Pricing & Sample Menu Items)
-- NOTE: This file contains DEMO / SEED catalog content for initial setup.
-- Run this in Supabase SQL Editor AFTER running schema.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Seed Categories (7 cuisines)
-- -----------------------------------------------------------------------------
INSERT INTO public.categories (name, slug, description, image_url, sort_order, is_active)
VALUES
  (
    'Biriyani',
    'biriyani',
    'Slow-cooked aromatic basmati rice layered with saffron, whole spices, and rich gravies.',
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    1,
    true
  ),
  (
    'Pizza',
    'pizza',
    'Hand-stretched artisan crusts baked stone-hot with fresh mozzarella and vibrant toppings.',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    2,
    true
  ),
  (
    'Burgers',
    'burgers',
    'Juicy grilled patties stacked in toasted brioche buns with house sauces and crisp greens.',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    3,
    true
  ),
  (
    'South Indian',
    'south-indian',
    'Golden fermented dosas, fluffy idlis, and filter-brewed classics served with sambar.',
    'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80',
    4,
    true
  ),
  (
    'Chinese',
    'chinese',
    'Wok-tossed noodles, smoky fried rice, and Indo-Chinese street favorites.',
    'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
    5,
    true
  ),
  (
    'Desserts',
    'desserts',
    'Warm traditional Indian sweets, molten chocolate cakes, and creamy indulgences.',
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80',
    6,
    true
  ),
  (
    'Beverages',
    'beverages',
    'Chilled mango lassi, cold coffee, sparkling mojitos, and spiced masala chai.',
    'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80',
    7,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- -----------------------------------------------------------------------------
-- 2. Seed Food Products (22 Sample Dishes with Realistic INR Prices)
-- -----------------------------------------------------------------------------
WITH cat AS (
  SELECT id, slug FROM public.categories
)
INSERT INTO public.products (
  category_id, name, slug, description, price_inr, image_url,
  is_veg, is_available, is_featured, is_popular, prep_time_mins, rating
)
VALUES
  -- BIRIYANI (4 items)
  (
    (SELECT id FROM cat WHERE slug = 'biriyani'),
    'Hyderabadi Chicken Dum Biriyani [Demo]',
    'hyderabadi-chicken-dum-biriyani',
    'Long-grain aged basmati rice dum-cooked with spiced marinated chicken, caramelized onions, mint, and saffron. Served with mirchi ka salan and cool raita.',
    329.00,
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=80',
    false, true, true, true, 30, 4.8
  ),
  (
    (SELECT id FROM cat WHERE slug = 'biriyani'),
    'Royal Mutton Zafrani Biriyani [Demo]',
    'royal-mutton-zafrani-biriyani',
    'Tender bone-in mutton simmered in Kashmiri saffron and roasted whole spices, sealed under flaky dough with fragrant basmati rice.',
    449.00,
    'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=900&q=80',
    false, true, true, false, 35, 4.9
  ),
  (
    (SELECT id FROM cat WHERE slug = 'biriyani'),
    'Subz Paneer Dum Biriyani [Demo]',
    'subz-paneer-dum-biriyani',
    'Char-grilled malai paneer cubes and seasonal garden vegetables layered with aromatic basmati rice, rose water, and roasted cashews.',
    279.00,
    'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=80',
    true, true, false, true, 25, 4.6
  ),
  (
    (SELECT id FROM cat WHERE slug = 'biriyani'),
    'Kolkata Egg & Potato Biriyani [Demo]',
    'kolkata-egg-potato-biriyani',
    'Lightly spiced fragrant rice featuring golden saffron-kissed potatoes and masala-seared eggs in authentic Kolkata style.',
    249.00,
    'https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&w=900&q=80',
    false, true, false, false, 25, 4.5
  ),

  -- PIZZA (3 items)
  (
    (SELECT id FROM cat WHERE slug = 'pizza'),
    'Smoky Tandoori Paneer Pizza [Demo]',
    'smoky-tandoori-paneer-pizza',
    '10-inch hand-tossed crust topped with tandoori-spiced paneer, charred bell peppers, red onions, and molten mozzarella.',
    349.00,
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',
    true, true, true, true, 22, 4.7
  ),
  (
    (SELECT id FROM cat WHERE slug = 'pizza'),
    'Classic Neapolitan Margherita [Demo]',
    'classic-neapolitan-margherita',
    'San Marzano style tomato sauce, fresh buffalo mozzarella, sweet basil leaves, and extra-virgin olive oil drizzle.',
    269.00,
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80',
    true, true, false, true, 18, 4.6
  ),
  (
    (SELECT id FROM cat WHERE slug = 'pizza'),
    'Spicy Chicken Pepperoni Feast [Demo]',
    'spicy-chicken-pepperoni-feast',
    'Loaded with smoked chicken pepperoni, pickled jalapenos, oregano, and double aged mozzarella on a crisp sourdough base.',
    399.00,
    'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80',
    false, true, false, false, 24, 4.8
  ),

  -- BURGERS (3 items)
  (
    (SELECT id FROM cat WHERE slug = 'burgers'),
    'Double Smash Cheese Burger [Demo]',
    'double-smash-cheese-burger',
    'Two seared chicken smash patties with melted cheddar, caramelized onions, dill pickles, and smoky chipotle mayo in a brioche bun.',
    259.00,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
    false, true, true, true, 18, 4.7
  ),
  (
    (SELECT id FROM cat WHERE slug = 'burgers'),
    'Crispy Herb Veg Crunch Burger [Demo]',
    'crispy-herb-veg-crunch-burger',
    'Golden panko-crusted herb & potato patty layered with crisp iceberg lettuce, spiced garlic aioli, and cheddar cheese.',
    179.00,
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
    true, true, false, true, 15, 4.4
  ),
  (
    (SELECT id FROM cat WHERE slug = 'burgers'),
    'Peri-Peri Grilled Chicken Burger [Demo]',
    'peri-peri-grilled-chicken-burger',
    'Flame-grilled chicken breast glazed in house peri-peri sauce with slaw, jalapenos, and butter-toasted sesame bun.',
    229.00,
    'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=900&q=80',
    false, true, false, false, 18, 4.6
  ),

  -- SOUTH INDIAN (3 items)
  (
    (SELECT id FROM cat WHERE slug = 'south-indian'),
    'Ghee Roast Masala Dosa [Demo]',
    'ghee-roast-masala-dosa',
    'Paper-crisp fermented rice crepe roasted in pure cow ghee, filled with tempered potato masala and served with three chutneys and sambar.',
    149.00,
    'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=900&q=80',
    true, true, true, true, 15, 4.8
  ),
  (
    (SELECT id FROM cat WHERE slug = 'south-indian'),
    'Podi Mini Idli & Medu Vada Combo [Demo]',
    'podi-mini-idli-vada-combo',
    'Steamed cloud-soft idlis tossed in spicy gunpowder podi & ghee alongside two crunchy golden medu vadas and piping hot drumstick sambar.',
    139.00,
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=900&q=80',
    true, true, false, true, 12, 4.7
  ),
  (
    (SELECT id FROM cat WHERE slug = 'south-indian'),
    'Mysore Cheese Uttapam [Demo]',
    'mysore-cheese-uttapam',
    'Thick savory pancake topped with red Mysore garlic chutney, diced onions, tomatoes, coriander, and grated cheese.',
    169.00,
    'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80',
    true, true, false, false, 16, 4.5
  ),

  -- CHINESE (3 items)
  (
    (SELECT id FROM cat WHERE slug = 'chinese'),
    'Wok-Tossed Schezwan Hakka Noodles [Demo]',
    'wok-tossed-schezwan-hakka-noodles',
    'Smoky high-flame noodles tossed with crunchy cabbage, bell peppers, spring onions, and house-made Schezwan chilli oil.',
    219.00,
    'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=900&q=80',
    true, true, false, true, 20, 4.6
  ),
  (
    (SELECT id FROM cat WHERE slug = 'chinese'),
    'Crispy Chilli Paneer Dry [Demo]',
    'crispy-chilli-paneer-dry',
    'Golden fried cottage cheese cubes glazed in soy, roasted garlic, green chillies, and spring onion greens.',
    249.00,
    'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=900&q=80',
    true, true, true, false, 20, 4.7
  ),
  (
    (SELECT id FROM cat WHERE slug = 'chinese'),
    'Burnt Garlic Chicken Fried Rice [Demo]',
    'burnt-garlic-chicken-fried-rice',
    'Fragrant wok-seared jasmine rice tossed with tender chicken strips, scrambled egg, crispy fried garlic, and white pepper.',
    239.00,
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80',
    false, true, false, true, 20, 4.6
  ),

  -- DESSERTS (3 items)
  (
    (SELECT id FROM cat WHERE slug = 'desserts'),
    'Warm Gulab Jamun with Rabri [Demo]',
    'warm-gulab-jamun-with-rabri',
    'Two melt-in-mouth khoya dumplings soaked in cardamom rose syrup, served over chilled saffron pistachio rabri.',
    129.00,
    'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?auto=format&fit=crop&w=900&q=80',
    true, true, true, true, 10, 4.9
  ),
  (
    (SELECT id FROM cat WHERE slug = 'desserts'),
    'Belgian Dark Choco Lava Cake [Demo]',
    'belgian-dark-choco-lava-cake',
    'Warm baked chocolate cake with an oozing 54% Belgian dark chocolate ganache center dusted with cocoa.',
    149.00,
    'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=900&q=80',
    true, true, false, true, 12, 4.8
  ),
  (
    (SELECT id FROM cat WHERE slug = 'desserts'),
    'Classic Tiramisu Jar [Demo]',
    'classic-tiramisu-jar',
    'Espresso-soaked savoiardi biscuits layered with whipped mascarpone cream and dark cocoa powder.',
    189.00,
    'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=80',
    true, true, false, false, 10, 4.7
  ),

  -- BEVERAGES (3 items)
  (
    (SELECT id FROM cat WHERE slug = 'beverages'),
    'Alphonso Mango Lassi [Demo]',
    'alphonso-mango-lassi',
    'Thick chilled probiotic yogurt churned with sweet Alphonso mango pulp and topped with crushed pistachios.',
    119.00,
    'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80',
    true, true, false, true, 8, 4.8
  ),
  (
    (SELECT id FROM cat WHERE slug = 'beverages'),
    'Belgian Hazelnut Cold Coffee [Demo]',
    'belgian-hazelnut-cold-coffee',
    'Double-shot roasted Arabica espresso blended silky smooth with chilled milk, hazelnut syrup, and cocoa foam.',
    139.00,
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80',
    true, true, true, true, 8, 4.7
  ),
  (
    (SELECT id FROM cat WHERE slug = 'beverages'),
    'Mint Cucumber Sparkling Mojito [Demo]',
    'mint-cucumber-sparkling-mojito',
    'Zero-proof refresher muddled with garden mint, lime zest, crisp cucumber ribbons, and sparkling soda.',
    99.00,
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80',
    true, true, false, false, 6, 4.5
  )
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_inr = EXCLUDED.price_inr,
  image_url = EXCLUDED.image_url,
  is_veg = EXCLUDED.is_veg,
  is_available = EXCLUDED.is_available,
  is_featured = EXCLUDED.is_featured,
  is_popular = EXCLUDED.is_popular,
  prep_time_mins = EXCLUDED.prep_time_mins,
  rating = EXCLUDED.rating;
