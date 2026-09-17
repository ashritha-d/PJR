import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // --- Users ---
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const customerPasswordHash = await bcrypt.hash("Customer@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@pjrfarm.com" },
    update: {},
    create: {
      name: "PJR Farm Admin",
      email: "admin@pjrfarm.com",
      phone: "9000000001",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@pjrfarm.com" },
    update: {},
    create: {
      name: "Ravi Kumar",
      email: "customer@pjrfarm.com",
      phone: "9000000002",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
      status: "ACTIVE",
    },
  });

  const address = await prisma.address.upsert({
    where: { id: "seed-address-1" },
    update: {},
    create: {
      id: "seed-address-1",
      userId: customer.id,
      label: "Home",
      fullName: "Ravi Kumar",
      phone: "9000000002",
      line1: "12-3-45, Gandhi Nagar",
      line2: "Near Water Tank",
      city: "Suryapet",
      state: "Telangana",
      pincode: "508213",
      isDefault: true,
    },
  });

  // --- Categories ---
  const categoryData = [
    {
      slug: "crop-cultivation",
      name: "Crop Cultivation",
      description: "Organically grown paddy, rice and grains cultivated with traditional care.",
      image: "/placeholders/crop.svg",
      displayOrder: 1,
    },
    {
      slug: "dairy-farming",
      name: "Dairy Farming",
      description: "Fresh and wholesome dairy products produced with care.",
      image: "/placeholders/dairy.svg",
      displayOrder: 2,
    },
    {
      slug: "fresh-vegetables",
      name: "Fresh Vegetables",
      description: "Fresh farm-grown vegetables delivered with quality and freshness.",
      image: "/placeholders/vegetables.svg",
      displayOrder: 3,
    },
    {
      slug: "pisciculture",
      name: "Pisciculture",
      description: "Sustainably farmed fish raised in clean, well-managed ponds.",
      image: "/farm/pisciculture-pond.jpg",
      displayOrder: 4,
    },
    {
      slug: "poultry-farming",
      name: "Poultry Farming",
      description: "Quality poultry products from responsible farming practices.",
      image: "/placeholders/poultry.svg",
      displayOrder: 5,
    },
    {
      slug: "livestock-rearing",
      name: "Livestock Rearing",
      description: "Ethically raised livestock reared with attention to animal well-being.",
      image: "/placeholders/livestock.svg",
      displayOrder: 6,
    },
  ];

  const categories: Record<string, string> = {};
  for (const c of categoryData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categories[c.slug] = cat.id;
  }

  // --- Products ---
  type SeedProduct = {
    name: string;
    slug: string;
    category: string;
    subcategory?: string;
    description: string;
    farmSource: string;
    storageInstructions: string;
    deliveryInfo: string;
    price: number;
    discountPrice?: number;
    sku: string;
    stock: number;
    unit: string;
    weight: string;
    isFeatured?: boolean;
    images: string[];
  };

  const products: SeedProduct[] = [
    {
      name: "Fresh Country Eggs",
      slug: "fresh-country-eggs",
      category: "poultry-farming",
      subcategory: "Eggs",
      description:
        "Free-range country eggs from healthy, naturally-reared hens. Rich in flavour and nutrition, collected fresh daily from our poultry farm.",
      farmSource: "PJR Poultry Unit, Bibigudem Village, Suryapet District",
      storageInstructions: "Refrigerate at 4°C. Best consumed within 10 days of delivery.",
      deliveryInfo: "Delivered in protective egg trays within 24-48 hours of order.",
      price: 120,
      sku: "PJR-EGG-CTY-12",
      stock: 80,
      unit: "12 Eggs",
      weight: "12 pieces",
      isFeatured: true,
      images: ["/placeholders/poultry.svg"],
    },
    {
      name: "Farm Fresh White Eggs",
      slug: "farm-fresh-white-eggs",
      category: "poultry-farming",
      subcategory: "Eggs",
      description: "Everyday white eggs from our poultry sheds, a nutritious protein staple for every family.",
      farmSource: "PJR Poultry Unit, Bibigudem Village, Suryapet District",
      storageInstructions: "Refrigerate at 4°C. Best consumed within 10 days of delivery.",
      deliveryInfo: "Delivered in protective egg trays within 24-48 hours of order.",
      price: 90,
      sku: "PJR-EGG-WHT-12",
      stock: 100,
      unit: "12 Eggs",
      weight: "12 pieces",
      images: ["/placeholders/poultry.svg"],
    },
    {
      name: "Farm Fresh Milk",
      slug: "farm-fresh-milk",
      category: "dairy-farming",
      subcategory: "Milk",
      description:
        "Pure, unadulterated cow milk from our dairy unit, delivered fresh with no preservatives — just wholesome nutrition for your family.",
      farmSource: "PJR Dairy Unit, Bibigudem Village, Suryapet District",
      storageInstructions: "Refrigerate immediately. Boil before consumption. Consume within 24 hours.",
      deliveryInfo: "Chilled delivery every morning between 6 AM – 9 AM.",
      price: 70,
      sku: "PJR-MLK-FRSH-1L",
      stock: 60,
      unit: "1 Litre",
      weight: "1 L",
      isFeatured: true,
      images: ["/placeholders/dairy.svg"],
    },
    {
      name: "Fresh Curd",
      slug: "fresh-curd",
      category: "dairy-farming",
      subcategory: "Curd & Yogurt",
      description: "Thick, creamy curd set the traditional way from our farm-fresh milk.",
      farmSource: "PJR Dairy Unit, Bibigudem Village, Suryapet District",
      storageInstructions: "Refrigerate at all times. Best consumed within 3 days.",
      deliveryInfo: "Delivered chilled in sealed containers.",
      price: 60,
      sku: "PJR-CURD-500",
      stock: 45,
      unit: "500g",
      weight: "500 g",
      images: ["/placeholders/dairy.svg"],
    },
    {
      name: "Fresh Paneer",
      slug: "fresh-paneer",
      category: "dairy-farming",
      subcategory: "Paneer",
      description: "Soft, protein-rich paneer made fresh from our farm's whole milk — perfect for everyday cooking.",
      farmSource: "PJR Dairy Unit, Bibigudem Village, Suryapet District",
      storageInstructions: "Refrigerate and use within 3-4 days. Keep immersed in water for extra freshness.",
      deliveryInfo: "Delivered chilled in vacuum-sealed packs.",
      price: 180,
      sku: "PJR-PANEER-500",
      stock: 35,
      unit: "500g",
      weight: "500 g",
      isFeatured: true,
      images: ["/placeholders/dairy.svg"],
    },
    {
      name: "Fresh Tomatoes",
      slug: "fresh-tomatoes",
      category: "fresh-vegetables",
      subcategory: "Vegetables",
      description: "Juicy, farm-ripened tomatoes grown without harmful chemicals, harvested at peak freshness.",
      farmSource: "PJR Vegetable Fields, Bibigudem Village, Suryapet District",
      storageInstructions: "Store in a cool, dry place or refrigerate for extended freshness.",
      deliveryInfo: "Delivered fresh within 24 hours of harvest.",
      price: 50,
      sku: "PJR-VEG-TOM-1K",
      stock: 120,
      unit: "1 Kg",
      weight: "1 kg",
      images: ["/placeholders/vegetables.svg"],
    },
    {
      name: "Fresh Leafy Vegetables (Palak)",
      slug: "fresh-leafy-vegetables-palak",
      category: "fresh-vegetables",
      subcategory: "Leafy Greens",
      description: "Nutrient-dense spinach leaves grown naturally, hand-picked and bundled fresh.",
      farmSource: "PJR Vegetable Fields, Bibigudem Village, Suryapet District",
      storageInstructions: "Refrigerate and consume within 2-3 days for best freshness.",
      deliveryInfo: "Delivered fresh within 24 hours of harvest.",
      price: 35,
      sku: "PJR-VEG-PLK-500",
      stock: 70,
      unit: "500g Bunch",
      weight: "500 g",
      images: ["/placeholders/vegetables.svg"],
    },
    {
      name: "Farm Fresh Produce Basket",
      slug: "farm-fresh-produce-basket",
      category: "fresh-vegetables",
      subcategory: "Mixed Vegetables",
      description: "A curated seasonal basket of our best farm-fresh vegetables — a wholesome mix for your weekly kitchen needs.",
      farmSource: "PJR Vegetable Fields, Bibigudem Village, Suryapet District",
      storageInstructions: "Refrigerate individual items after unpacking.",
      deliveryInfo: "Delivered fresh within 24 hours of harvest.",
      price: 250,
      discountPrice: 220,
      sku: "PJR-VEG-BSKT-3K",
      stock: 25,
      unit: "3 Kg Basket",
      weight: "3 kg",
      isFeatured: true,
      images: ["/placeholders/vegetables.svg"],
    },
    {
      name: "Fresh Water Fish (Rohu)",
      slug: "fresh-water-fish-rohu",
      category: "pisciculture",
      subcategory: "Fish",
      description:
        "Fresh Rohu fish raised in our clean, well-aerated ponds using sustainable aquaculture practices — cleaned and ready to cook.",
      farmSource: "PJR Aquaculture Ponds, Bibigudem Village, Suryapet District",
      storageInstructions: "Refrigerate immediately, or freeze for extended storage.",
      deliveryInfo: "Delivered fresh on ice within a few hours of harvest.",
      price: 350,
      sku: "PJR-FISH-ROHU-1K",
      stock: 30,
      unit: "1 Kg",
      weight: "1 kg",
      isFeatured: true,
      images: ["/farm/pisciculture-pond.jpg"],
    },
    {
      name: "Fresh Country Chicken",
      slug: "fresh-country-chicken",
      category: "poultry-farming",
      subcategory: "Chicken",
      description: "Naturally reared country chicken, cleaned and dressed fresh — full of flavour and nutrition.",
      farmSource: "PJR Poultry Unit, Bibigudem Village, Suryapet District",
      storageInstructions: "Refrigerate immediately, or freeze for extended storage.",
      deliveryInfo: "Delivered fresh, cleaned and ready to cook.",
      price: 280,
      sku: "PJR-CHKN-1K",
      stock: 40,
      unit: "1 Kg",
      weight: "1 kg",
      isFeatured: true,
      images: ["/placeholders/poultry.svg"],
    },
    {
      name: "Fresh Mutton",
      slug: "fresh-mutton",
      category: "livestock-rearing",
      subcategory: "Mutton",
      description: "Premium quality mutton from ethically reared livestock, cleaned and cut fresh to order.",
      farmSource: "PJR Livestock Unit, Bibigudem Village, Suryapet District",
      storageInstructions: "Refrigerate immediately, or freeze for extended storage.",
      deliveryInfo: "Delivered fresh, cleaned and cut to order.",
      price: 750,
      sku: "PJR-MTN-1K",
      stock: 20,
      unit: "1 Kg",
      weight: "1 kg",
      images: ["/placeholders/livestock.svg"],
    },
    {
      name: "Farm Fresh Ghee",
      slug: "farm-fresh-ghee",
      category: "dairy-farming",
      subcategory: "Ghee",
      description: "Traditional bilona-method ghee made from farm-fresh cow milk cream — rich aroma, pure taste.",
      farmSource: "PJR Dairy Unit, Bibigudem Village, Suryapet District",
      storageInstructions: "Store in a cool, dry place away from direct sunlight. No refrigeration required.",
      deliveryInfo: "Delivered in sealed glass jars.",
      price: 650,
      discountPrice: 599,
      sku: "PJR-GHEE-500",
      stock: 30,
      unit: "500ml",
      weight: "500 ml",
      images: ["/placeholders/dairy.svg"],
    },
    {
      name: "PJR Organic Rice",
      slug: "pjr-organic-rice",
      category: "crop-cultivation",
      subcategory: "Rice & Grains",
      description:
        "Sona Masoori rice grown using integrated organic farming practices on our own fields — chemical-free, naturally nourishing, and a true farm-to-family staple.",
      farmSource: "PJR Paddy Fields, Bibigudem Village, Suryapet District",
      storageInstructions: "Store in a cool, dry place in an airtight container.",
      deliveryInfo: "Delivered in 9.07kg (20lb) woven bags.",
      price: 950,
      sku: "PJR-RICE-ORG-9K",
      stock: 50,
      unit: "9.07 Kg Bag",
      weight: "9.07 kg / 20 lbs",
      isFeatured: true,
      images: ["/products/pjr-organic-rice-1.jpg", "/products/pjr-organic-rice-2.jpg"],
    },
    {
      name: "Farm Fresh Country Goat Milk",
      slug: "farm-fresh-goat-milk",
      category: "livestock-rearing",
      subcategory: "Goat Milk",
      description: "Nutrient-rich goat milk from our livestock unit, valued for its easy digestibility and natural richness.",
      farmSource: "PJR Livestock Unit, Bibigudem Village, Suryapet District",
      storageInstructions: "Refrigerate immediately. Boil before consumption.",
      deliveryInfo: "Chilled delivery every morning.",
      price: 150,
      sku: "PJR-GTMLK-500",
      stock: 15,
      unit: "500ml",
      weight: "500 ml",
      images: ["/placeholders/livestock.svg"],
    },
  ];

  for (const p of products) {
    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        categoryId: categories[p.category],
        subcategory: p.subcategory,
        description: p.description,
        farmSource: p.farmSource,
        storageInstructions: p.storageInstructions,
        deliveryInfo: p.deliveryInfo,
        price: p.price,
        discountPrice: p.discountPrice ?? null,
        sku: p.sku,
        stock: p.stock,
        unit: p.unit,
        weight: p.weight,
        isFeatured: p.isFeatured ?? false,
        availability: p.stock > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
        ratingAvg: 4.2 + Math.random() * 0.6,
        ratingCount: Math.floor(5 + Math.random() * 40),
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: created.id } });
    for (let i = 0; i < p.images.length; i++) {
      await prisma.productImage.create({
        data: { productId: created.id, url: p.images[i], order: i },
      });
    }
  }

  // --- Reviews ---
  const rice = await prisma.product.findUnique({ where: { slug: "pjr-organic-rice" } });
  const milk = await prisma.product.findUnique({ where: { slug: "farm-fresh-milk" } });
  if (rice) {
    await prisma.review.create({
      data: {
        productId: rice.id,
        userId: customer.id,
        rating: 5,
        title: "Best rice we've tried",
        comment: "The aroma and quality are unmatched. Will definitely reorder every month.",
        status: "APPROVED",
      },
    });
  }
  if (milk) {
    await prisma.review.create({
      data: {
        productId: milk.id,
        userId: customer.id,
        rating: 4,
        title: "Fresh and creamy",
        comment: "Tastes just like milk from my grandmother's village. Delivered on time too.",
        status: "APPROVED",
      },
    });
  }

  // --- Coupon ---
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      discountType: "PERCENT",
      discountValue: 10,
      minOrderAmount: 300,
      maxDiscount: 150,
      startDate: new Date("2026-01-01"),
      expiryDate: new Date("2027-01-01"),
      usageLimit: 500,
      status: "ACTIVE",
    },
  });

  // --- Banners ---
  const bannerData = [
    {
      title: "Fresh From Our Farm to Your Family",
      subtitle: "Wholesome agricultural products grown and produced with care, responsibility, and respect for nature.",
      image: "/farm/pisciculture-pond.jpg",
      buttonText: "Shop Fresh Products",
      buttonLink: "/products",
      displayOrder: 1,
    },
    {
      title: "Real Farms. Real Families. Real Food.",
      subtitle: "Meet the people behind every harvest — integrated farming rooted in Suryapet, Telangana since 2017.",
      image: "/farm/pisciculture-farmer-portrait.jpg",
      buttonText: "Explore Our Farm",
      buttonLink: "/our-farming",
      displayOrder: 2,
    },
  ];
  for (const b of bannerData) {
    const existing = await prisma.banner.findFirst({ where: { title: b.title } });
    if (!existing) await prisma.banner.create({ data: b });
  }

  // --- Farm Sections ---
  const farmSections = [
    {
      key: "crop-cultivation",
      title: "Crop Cultivation",
      description:
        "Organic paddy and grain cultivation using traditional methods, neem-based natural pest control, and chemical-free practices passed down through generations.",
      image: "/products/pjr-organic-rice-1.jpg",
      displayOrder: 1,
    },
    {
      key: "dairy-farming",
      title: "Dairy Farming",
      description:
        "A dedicated dairy unit producing fresh milk, curd, paneer and ghee daily, with animal well-being and hygiene at the centre of every practice.",
      image: "/placeholders/dairy.svg",
      displayOrder: 2,
    },
    {
      key: "fresh-vegetables",
      title: "Fresh Vegetables",
      description:
        "Seasonal vegetables grown across our fields and harvested at peak freshness, reaching your kitchen within 24 hours.",
      image: "/placeholders/vegetables.svg",
      displayOrder: 3,
    },
    {
      key: "pisciculture",
      title: "Pisciculture",
      description:
        "Sustainable aquaculture in clean, well-managed ponds — celebrated every National Fish Farmers Day for strong farms, healthy fish and a sustainable future.",
      image: "/farm/pisciculture-fish-farmers-day.jpg",
      displayOrder: 4,
    },
    {
      key: "poultry-farming",
      title: "Poultry Farming",
      description:
        "Free-range poultry sheds rearing both country and farm chicken breeds responsibly, producing fresh eggs and chicken for local families.",
      image: "/placeholders/poultry.svg",
      displayOrder: 5,
    },
    {
      key: "livestock-rearing",
      title: "Livestock Rearing",
      description:
        "Sheep, goats and cattle reared with attention to animal welfare, supporting both dairy production and the rural livelihoods around our farm.",
      image: "/placeholders/livestock.svg",
      displayOrder: 6,
    },
  ];
  for (const f of farmSections) {
    await prisma.farmSection.upsert({ where: { key: f.key }, update: {}, create: f });
  }

  // --- Homepage Content ---
  await prisma.homepageContent.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      heroHeading: "Fresh From Our Farm to Your Family",
      heroSubheading:
        "Wholesome agricultural products grown and produced with care, responsibility, and respect for nature.",
      heroImage: "/farm/pisciculture-pond.jpg",
      heroButtons: JSON.stringify([
        { text: "Shop Fresh Products", href: "/products" },
        { text: "Explore Our Farm", href: "/our-farming" },
      ]),
      whyChooseUs: JSON.stringify([
        { icon: "Leaf", title: "Fresh From Farm", description: "Harvested and delivered within hours, not days." },
        { icon: "ShieldCheck", title: "Responsible Farming", description: "Chemical-free, sustainable practices at every stage." },
        { icon: "Award", title: "Quality Products", description: "Every batch checked for freshness and quality." },
        { icon: "Sprout", title: "Sustainable Practices", description: "Caring for the land as much as the harvest." },
        { icon: "Calendar", title: "Trusted Since 2017", description: "Years of dedicated integrated farming experience." },
        { icon: "Home", title: "Farm-to-Family", description: "Cutting out the middlemen, straight from our fields." },
        { icon: "Heart", title: "Natural Approach", description: "No shortcuts — just nature, patience and care." },
        { icon: "Smile", title: "Customer Satisfaction", description: "Families across the region trust PJR Farm daily." },
      ]),
      testimonials: JSON.stringify([
        { name: "Lakshmi Devi", location: "Suryapet", rating: 5, comment: "The freshest milk and vegetables I've had delivered to my door. Truly farm to family!" },
        { name: "Ramesh Reddy", location: "Hyderabad", rating: 5, comment: "PJR Farm's organic rice has become a staple in our home. You can taste the difference." },
        { name: "Anjali Sharma", location: "Nalgonda", rating: 4, comment: "Loved the fish and chicken quality. Ordering is simple and delivery is always on time." },
      ]),
    },
  });

  // --- Site Settings ---
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      businessName: "PJR Farm & Agro Products",
      tagline: "Nourishing Nature, Enriching Lives.",
      logoUrl: "/brand/logo-horizontal.jpg",
      faviconUrl: "/brand/logo-emblem.jpg",
      phone: "+91 90000 00000",
      whatsapp: "+91 90000 00000",
      email: "info@pjrfarm.example",
      address: "PJR Farm & Agro Products, Bibigudem Village, Suryapet District, Telangana, India",
      workingHours: "Mon – Sat: 7:00 AM – 8:00 PM",
      mapEmbedUrl: "",
      socialLinks: JSON.stringify({ facebook: "", instagram: "", youtube: "", twitter: "" }),
      deliveryChargeFlat: 40,
      freeDeliveryThreshold: 999,
      taxPercent: 0,
      lowStockThreshold: 10,
      currency: "INR",
    },
  });

  // --- Sample Order ---
  const eggs = await prisma.product.findUnique({ where: { slug: "fresh-country-eggs" } });
  if (rice && eggs) {
    const existingOrder = await prisma.order.findFirst({ where: { orderNumber: "PJR26010001" } });
    if (!existingOrder) {
      const subtotal = rice.price + eggs.price * 2;
      const deliveryCharge = subtotal > 999 ? 0 : 40;
      const order = await prisma.order.create({
        data: {
          orderNumber: "PJR26010001",
          userId: customer.id,
          addressId: address.id,
          status: "DELIVERED",
          paymentStatus: "PAID",
          paymentMethod: "COD",
          subtotal,
          deliveryCharge,
          discount: 0,
          tax: 0,
          grandTotal: subtotal + deliveryCharge,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email,
          addressSnapshot: `${address.fullName}, ${address.line1}, ${address.city}, ${address.state} - ${address.pincode}, Phone: ${address.phone}`,
          placedAt: new Date("2026-08-05"),
          items: {
            create: [
              {
                productId: rice.id,
                name: rice.name,
                unit: rice.unit,
                image: "/products/pjr-organic-rice-1.jpg",
                price: rice.price,
                quantity: 1,
                lineTotal: rice.price,
              },
              {
                productId: eggs.id,
                name: eggs.name,
                unit: eggs.unit,
                image: "/placeholders/poultry.svg",
                price: eggs.price,
                quantity: 2,
                lineTotal: eggs.price * 2,
              },
            ],
          },
          statusHistory: {
            create: [
              { status: "PLACED", note: "Order placed by customer" },
              { status: "CONFIRMED", note: "Order confirmed" },
              { status: "DELIVERED", note: "Order delivered successfully" },
            ],
          },
        },
      });
      console.log("Created sample order:", order.orderNumber);
    }
  }

  console.log("Seeding complete.");
  console.log("Admin login: admin@pjrfarm.com / Admin@123");
  console.log("Customer login: customer@pjrfarm.com / Customer@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
