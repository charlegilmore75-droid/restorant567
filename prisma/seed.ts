import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Seed superadmin
  const superadminEmail =
    process.env.SUPERADMIN_EMAIL || "admin738ehdi83jje8eihe8@gmail.com";
  const superadminPassword =
    process.env.SUPERADMIN_PASSWORD || "SuperAdmin@2024!";

  const existing = await prisma.user.findUnique({
    where: { email: superadminEmail },
  });

  if (!existing) {
    const hashed = await bcrypt.hash(superadminPassword, 12);
    await prisma.user.create({
      data: {
        email: superadminEmail,
        password: hashed,
        name: "Super Admin",
        role: Role.SUPERADMIN,
      },
    });
    console.log("✅ Superadmin created:", superadminEmail);
  } else {
    console.log("ℹ️  Superadmin already exists:", superadminEmail);
  }

  // Seed site settings
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "Restorant",
      primaryColor: "#C9A84C",
      accentColor: "#1A1A2E",
      heroTitle: "Fine Dining Experience",
      heroTitleAr: "تجربة طعام راقية",
      tagline: "Crafted with passion, served with love",
      taglineAr: "مصنوع بشغف، يُقدَّم بمحبة",
      currency: "USD",
      currencySymbol: "$",
    },
  });
  console.log("✅ Site settings initialized");

  // Seed categories
  const categories = [
    {
      name: "Starters",
      nameAr: "المقبلات",
      nameDe: "Vorspeisen",
      nameFr: "Entrées",
      nameRu: "Закуски",
      sortOrder: 1,
    },
    {
      name: "Main Course",
      nameAr: "الأطباق الرئيسية",
      nameDe: "Hauptgerichte",
      nameFr: "Plats principaux",
      nameRu: "Основные блюда",
      sortOrder: 2,
    },
    {
      name: "Grills",
      nameAr: "المشويات",
      nameDe: "Grillgerichte",
      nameFr: "Grillades",
      nameRu: "Гриль",
      sortOrder: 3,
    },
    {
      name: "Desserts",
      nameAr: "الحلويات",
      nameDe: "Desserts",
      nameFr: "Desserts",
      nameRu: "Десерты",
      sortOrder: 4,
    },
    {
      name: "Beverages",
      nameAr: "المشروبات",
      nameDe: "Getränke",
      nameFr: "Boissons",
      nameRu: "Напитки",
      sortOrder: 5,
    },
  ];

  const createdCategories: Record<string, string> = {};
  for (const cat of categories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name },
    });
    if (!existing) {
      const created = await prisma.category.create({ data: cat });
      createdCategories[cat.name] = created.id;
    } else {
      createdCategories[cat.name] = existing.id;
    }
  }
  console.log("✅ Categories seeded");

  // Seed products
  const products = [
    {
      name: "Hummus Platter",
      nameAr: "طبق الحمص",
      description: "Creamy hummus with olive oil, paprika, and pita bread",
      descAr: "حمص كريمي مع زيت الزيتون والبابريكا والخبز العربي",
      price: 8.99,
      categoryId: createdCategories["Starters"],
      isFeatured: true,
      image:
        "https://images.unsplash.com/photo-1577906096429-f73a2ceded4a?w=600",
    },
    {
      name: "Falafel Wrap",
      nameAr: "لفائف الفلافل",
      description: "Crispy falafel with tahini, vegetables in warm flatbread",
      descAr: "فلافل مقرمشة مع الطحينة والخضروات في خبز مسطح دافئ",
      price: 11.99,
      categoryId: createdCategories["Starters"],
      image:
        "https://images.unsplash.com/photo-1547496502-affa22d38842?w=600",
    },
    {
      name: "Grilled Lamb Chops",
      nameAr: "ضلوع الضأن المشوية",
      description: "Tender lamb chops marinated in herbs and spices",
      descAr: "ضلوع ضأن طرية متبلة بالأعشاب والتوابل",
      price: 28.99,
      categoryId: createdCategories["Grills"],
      isFeatured: true,
      image:
        "https://images.unsplash.com/photo-1544025162-d76538485551?w=600",
    },
    {
      name: "Chicken Shawarma Plate",
      nameAr: "طبق شاورما الدجاج",
      description: "Slow-roasted chicken with garlic sauce and fresh salad",
      descAr: "دجاج مشوي ببطء مع صلصة الثوم والسلطة الطازجة",
      price: 16.99,
      categoryId: createdCategories["Main Course"],
      isFeatured: true,
      image:
        "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600",
    },
    {
      name: "Beef Kofta",
      nameAr: "كفتة اللحم",
      description: "Spiced ground beef skewers with roasted vegetables",
      descAr: "أسياخ لحم بقري مفروم متبل مع خضروات مشوية",
      price: 19.99,
      categoryId: createdCategories["Grills"],
      image:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600",
    },
    {
      name: "Mixed Grill Platter",
      nameAr: "طبق المشاوي المشكل",
      description: "Selection of grilled meats, served with rice and salad",
      descAr: "تشكيلة من اللحوم المشوية، تُقدَّم مع الأرز والسلطة",
      price: 34.99,
      categoryId: createdCategories["Grills"],
      isFeatured: true,
      image:
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
    },
    {
      name: "Baklava",
      nameAr: "البقلاوة",
      description: "Flaky pastry filled with nuts and sweet honey syrup",
      descAr: "معجنات هشة محشوة بالمكسرات وشراب العسل الحلو",
      price: 7.99,
      categoryId: createdCategories["Desserts"],
      image:
        "https://images.unsplash.com/photo-1519915028121-7d3463d5b1b2?w=600",
    },
    {
      name: "Kunafa",
      nameAr: "الكنافة",
      description: "Traditional cheese pastry soaked in sweet syrup",
      descAr: "معجنات الجبن التقليدية المنقوعة في شراب حلو",
      price: 9.99,
      categoryId: createdCategories["Desserts"],
      isFeatured: true,
      image:
        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600",
    },
    {
      name: "Fresh Mint Lemonade",
      nameAr: "عصير الليمون بالنعناع الطازج",
      description: "Refreshing lemonade with fresh mint and ice",
      descAr: "عصير ليمون منعش مع النعناع الطازج والثلج",
      price: 4.99,
      categoryId: createdCategories["Beverages"],
      image:
        "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600",
    },
    {
      name: "Arabic Coffee",
      nameAr: "القهوة العربية",
      description: "Traditional cardamom-spiced Arabic coffee",
      descAr: "القهوة العربية التقليدية بنكهة الهيل",
      price: 3.99,
      categoryId: createdCategories["Beverages"],
      image:
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600",
    },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });
    if (!existing) {
      await prisma.product.create({ data: product });
    }
  }
  console.log("✅ Products seeded");

  // Seed payment settings
  const providers = ["stripe", "paypal", "cash"];
  for (const provider of providers) {
    await prisma.paymentSettings.upsert({
      where: { provider },
      update: {},
      create: {
        provider,
        isEnabled: provider === "cash",
      },
    });
  }
  console.log("✅ Payment providers initialized");

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
