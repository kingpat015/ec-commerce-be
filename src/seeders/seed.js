const pool = require("../config/database");
const { hashPassword } = require("../utils/bcrypt");

async function seedDatabase() {
  const connection = await pool.getConnection();

  try {
    console.log("Starting database seeding...");

    // Check if database is already seeded
    const [existingUsers] = await connection.query(
      "SELECT COUNT(*) as count FROM users"
    );
    if (existingUsers[0].count > 0) {
      console.log("⚠️  Database already contains data. Skipping seed.");
      console.log("To re-seed, manually truncate tables first.");
      return;
    }

    // 1. Seed Roles
    console.log("Seeding roles...");
    const roles = [
      { name: "admin", description: "Administrator with full access" },
      { name: "hr_user", description: "HR Manager" },
      { name: "sales_user", description: "Sales Manager" },
      { name: "user", description: "Regular User" },
      { name: "customer_user", description: "Customer" },
    ];

    const roleIds = {};
    for (const role of roles) {
      const [result] = await connection.query(
        "INSERT INTO roles (name, description) VALUES (?, ?)",
        [role.name, role.description]
      );
      roleIds[role.name] = result.insertId;
    }
    console.log("✓ Roles seeded");

    // 2. Seed Users
    console.log("Seeding users...");
    const users = [
      {
        name: "System Administrator",
        email: "emmc.systems@gmail.com",
        password: await hashPassword("admin123"),
        role_id: roleIds.admin,
      },
      {
        name: "HR Manager",
        email: "hr@company.com",
        password: await hashPassword("hr123"),
        role_id: roleIds.hr_user,
      },
      {
        name: "Sales Manager",
        email: "sales@company.com",
        password: await hashPassword("sales123"),
        role_id: roleIds.sales_user,
      },
      {
        name: "John Doe",
        email: "user@company.com",
        password: await hashPassword("user123"),
        role_id: roleIds.user,
      },
      {
        name: "Jane Smith",
        email: "customer@example.com",
        password: await hashPassword("customer123"),
        role_id: roleIds.customer_user,
      },
    ];

    for (const user of users) {
      await connection.query(
        "INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
        [user.name, user.email, user.password, user.role_id]
      );
    }
    console.log("✓ Users seeded");

    // 3. Seed Product Categories
    console.log("Seeding product categories...");
    const categories = [
      {
        name: "Corrugated Boxes",
        slug: "corrugated-boxes",
        description:
          "Regular Slotted Container (RSC) and custom corrugated boxes for shipping and storage",
      },
      {
        name: "Corrugated Plastic",
        slug: "corrugated-plastic",
        description:
          "Coroplast, IntePro, Corrx - extruded twinwall plastic-sheet products from polypropylene resin",
      },
      {
        name: "Cushioning Foam",
        slug: "cushioning-foam",
        description:
          "Polyethylene foam with optimal cushioning protection for packaging",
      },
      {
        name: "Colored Boxes",
        slug: "colored-boxes",
        description: "Custom color box packaging with decorative designs",
      },
      {
        name: "Insulators",
        slug: "insulators",
        description:
          "Thermal insulation products for temperature-sensitive shipments",
      },
      {
        name: "Paper Pallet",
        slug: "paper-pallet",
        description: "Eco-friendly paper pallets for logistics and warehousing",
      },
    ];

    for (const category of categories) {
      await connection.query(
        "INSERT INTO product_categories (name, slug, description) VALUES (?, ?, ?)",
        [category.name, category.slug, category.description]
      );
    }
    console.log("✓ Product categories seeded");

    // 4. Seed Products
    console.log("Seeding products...");
    const products = [
      // Corrugated Boxes
      {
        name: "RSC Box - Single Wall (Small)",
        short_description: "Regular Slotted Container for light packaging",
        description:
          "Standard Regular Slotted Container (RSC) with single wall construction. All flaps are the same length from score to edge. Major flaps meet in the middle and minor flaps do not. Ideal for general shipping and storage of light to medium weight items.",
        price: 25.0,
        stock: 500,
        category_id: 1,
        image_url:
          "https://images.unsplash.com/photo-1566694271453-390536dd1f0d?w=500",
        created_by: 3,
      },
      {
        name: "RSC Box - Single Wall (Medium)",
        short_description: "Medium-sized RSC box for standard shipping",
        description:
          "Medium-sized Regular Slotted Container with single wall corrugated construction. Perfect for e-commerce, retail, and general shipping needs. Durable and cost-effective packaging solution.",
        price: 35.0,
        stock: 400,
        category_id: 1,
        image_url:
          "https://images.unsplash.com/photo-1566694271453-390536dd1f0d?w=500",
        created_by: 3,
      },
      {
        name: "RSC Box - Single Wall (Large)",
        short_description: "Large RSC box for heavy-duty applications",
        description:
          "Large Regular Slotted Container designed for heavier items. Single wall construction provides reliable protection for various products during shipping and storage.",
        price: 45.0,
        stock: 350,
        category_id: 1,
        image_url:
          "https://images.unsplash.com/photo-1566694271453-390536dd1f0d?w=500",
        created_by: 3,
      },
      {
        name: "RSC Box - Double Wall (Medium)",
        short_description: "Extra strength double wall corrugated box",
        description:
          "Double wall corrugated RSC box for maximum protection. Features enhanced strength and durability for heavy or fragile items. Ideal for electronics, machinery parts, and valuable goods.",
        price: 65.0,
        stock: 300,
        category_id: 1,
        image_url:
          "https://images.unsplash.com/photo-1566694271453-390536dd1f0d?w=500",
        created_by: 3,
      },
      {
        name: "RSC Box - Double Wall (Large)",
        short_description: "Heavy-duty double wall box for industrial use",
        description:
          "Large double wall Regular Slotted Container for industrial applications. Provides superior strength and protection for heavy equipment, machinery, and bulk shipments.",
        price: 85.0,
        stock: 250,
        category_id: 1,
        image_url:
          "https://images.unsplash.com/photo-1566694271453-390536dd1f0d?w=500",
        created_by: 3,
      },
      {
        name: "RSC Box - Tri Wall",
        short_description: "Maximum strength tri-wall corrugated box",
        description:
          "Tri-wall corrugated RSC box offering the highest level of protection and strength. Perfect for international shipping, heavy machinery, and extremely valuable or fragile items.",
        price: 150.0,
        stock: 150,
        category_id: 1,
        image_url:
          "https://images.unsplash.com/photo-1566694271453-390536dd1f0d?w=500",
        created_by: 3,
      },

      // Corrugated Plastic
      {
        name: "Coroplast Sheet 4mm",
        short_description: "Standard thickness corrugated plastic sheet",
        description:
          "High-quality extruded twinwall plastic sheet made from high-impact polypropylene resin. 4mm thickness provides excellent durability and protection. Perfect for signage, packaging dividers, and protective layers.",
        price: 180.0,
        stock: 200,
        category_id: 2,
        image_url:
          "https://images.unsplash.com/photo-1594737625785-8b0ea7a5e5f1?w=500",
        created_by: 3,
      },
      {
        name: "Coroplast Sheet 6mm",
        short_description: "Heavy-duty corrugated plastic sheet",
        description:
          "6mm thick corrugated plastic sheet with enhanced rigidity and impact resistance. Ideal for construction site signage, reusable packaging solutions, and protective applications.",
        price: 250.0,
        stock: 180,
        category_id: 2,
        image_url:
          "https://images.unsplash.com/photo-1594737625785-8b0ea7a5e5f1?w=500",
        created_by: 3,
      },
      {
        name: "IntePro Divider Sheets",
        short_description: "Custom-cut plastic dividers for packaging",
        description:
          "Pre-cut IntePro corrugated plastic dividers designed for organizing and protecting products within boxes. Reusable, waterproof, and chemical resistant. Perfect for electronics and pharmaceutical packaging.",
        price: 35.0,
        stock: 400,
        category_id: 2,
        image_url:
          "https://images.unsplash.com/photo-1594737625785-8b0ea7a5e5f1?w=500",
        created_by: 3,
      },
      {
        name: "Corrx Protective Panels",
        short_description: "Durable protection panels for shipping",
        description:
          "Corrx brand corrugated plastic panels for protecting goods during transit. Lightweight yet strong, these panels provide excellent cushioning and can be reused multiple times.",
        price: 120.0,
        stock: 220,
        category_id: 2,
        image_url:
          "https://images.unsplash.com/photo-1594737625785-8b0ea7a5e5f1?w=500",
        created_by: 3,
      },
      {
        name: "Twinplast Custom Box Insert",
        short_description: "Custom-designed plastic box inserts",
        description:
          "Twinplast corrugated plastic custom box inserts tailored to your product specifications. Provides secure positioning and protection for delicate items during shipping and handling.",
        price: 85.0,
        stock: 180,
        category_id: 2,
        image_url:
          "https://images.unsplash.com/photo-1594737625785-8b0ea7a5e5f1?w=500",
        created_by: 3,
      },

      // Cushioning Foam
      {
        name: "Polyethylene Foam Sheet 3mm",
        short_description: "Thin foam sheet for light cushioning",
        description:
          "Extruded polyethylene foam with excellent dimensional stability and recovery characteristics. 3mm thickness provides optimal cushioning protection against repeated impacts. Ideal for wrapping electronics and delicate items.",
        price: 45.0,
        stock: 350,
        category_id: 3,
        image_url:
          "https://images.unsplash.com/photo-1566207462754-97c86c31db3d?w=500",
        created_by: 3,
      },
      {
        name: "Polyethylene Foam Sheet 5mm",
        short_description: "Medium density foam for general protection",
        description:
          "5mm polyethylene foam sheet offering superior cushioning and shock absorption. Perfect for packaging electronics, semiconductors, and fragile products. Resistant to chemicals and moisture.",
        price: 65.0,
        stock: 300,
        category_id: 3,
        image_url:
          "https://images.unsplash.com/photo-1566207462754-97c86c31db3d?w=500",
        created_by: 3,
      },
      {
        name: "Polyethylene Foam Sheet 10mm",
        short_description: "Heavy-duty foam for maximum protection",
        description:
          "10mm thick polyethylene foam providing maximum cushioning and impact protection. Ideal for heavy or highly fragile items. Excellent recovery characteristics ensure long-lasting protection through multiple impacts.",
        price: 95.0,
        stock: 250,
        category_id: 3,
        image_url:
          "https://images.unsplash.com/photo-1566207462754-97c86c31db3d?w=500",
        created_by: 3,
      },
      {
        name: "Custom Foam Insert",
        short_description: "Precision-cut foam for product-specific packaging",
        description:
          "Custom-designed polyethylene foam inserts precisely cut to fit your product specifications. Provides optimal protection and professional presentation for electronics, medical devices, and precision instruments.",
        price: 120.0,
        stock: 200,
        category_id: 3,
        image_url:
          "https://images.unsplash.com/photo-1566207462754-97c86c31db3d?w=500",
        created_by: 3,
      },
      {
        name: "Anti-Static Foam Sheet",
        short_description: "ESD-safe foam for electronic components",
        description:
          "Specially formulated anti-static polyethylene foam for protecting sensitive electronic components and semiconductors. Prevents electrostatic discharge while providing excellent cushioning properties.",
        price: 150.0,
        stock: 180,
        category_id: 3,
        image_url:
          "https://images.unsplash.com/photo-1566207462754-97c86c31db3d?w=500",
        created_by: 3,
      },

      // Colored Boxes
      {
        name: "Printed Color Box - Small",
        short_description: "Custom printed packaging box",
        description:
          "Small color box with custom printing and decorative design. Perfect for retail packaging, gift boxes, and product presentation. Full-color printing available with your branding and design.",
        price: 55.0,
        stock: 280,
        category_id: 4,
        image_url:
          "https://images.unsplash.com/photo-1565114332263-389352d0a5f6?w=500",
        created_by: 3,
      },
      {
        name: "Printed Color Box - Medium",
        short_description: "Medium-sized custom branded box",
        description:
          "Medium color box packaging with professional printing and design. Enhances product presentation and brand recognition. Ideal for cosmetics, electronics, food products, and pharmaceuticals.",
        price: 75.0,
        stock: 250,
        category_id: 4,
        image_url:
          "https://images.unsplash.com/photo-1565114332263-389352d0a5f6?w=500",
        created_by: 3,
      },
      {
        name: "Printed Color Box - Large",
        short_description: "Large premium packaging box",
        description:
          "Large color box with high-quality printing and attractive design. Perfect for premium products, gift sets, and special editions. Creates strong visual impact and brand awareness.",
        price: 95.0,
        stock: 220,
        category_id: 4,
        image_url:
          "https://images.unsplash.com/photo-1565114332263-389352d0a5f6?w=500",
        created_by: 3,
      },
      {
        name: "Folding Carton with Window",
        short_description: "Display box with clear window panel",
        description:
          "Colored folding carton featuring a clear window panel for product visibility. Combines attractive design with practical functionality. Perfect for food, toys, and consumer goods.",
        price: 65.0,
        stock: 260,
        category_id: 4,
        image_url:
          "https://images.unsplash.com/photo-1565114332263-389352d0a5f6?w=500",
        created_by: 3,
      },

      // Insulators
      {
        name: "Thermal Insulation Liner - Small",
        short_description: "Temperature control packaging liner",
        description:
          "Small thermal insulation liner for maintaining temperature-sensitive products. Ideal for food, pharmaceuticals, and biological samples. Provides reliable temperature control during shipping.",
        price: 85.0,
        stock: 200,
        category_id: 5,
        image_url:
          "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=500",
        created_by: 3,
      },
      {
        name: "Thermal Insulation Liner - Medium",
        short_description: "Medium insulated shipping solution",
        description:
          "Medium-sized thermal insulation liner offering extended temperature protection. Perfect for pharmaceutical shipments, fresh produce, and frozen goods. Maintains cold chain integrity.",
        price: 125.0,
        stock: 180,
        category_id: 5,
        image_url:
          "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=500",
        created_by: 3,
      },
      {
        name: "Thermal Insulation Liner - Large",
        short_description: "Large-capacity insulated packaging",
        description:
          "Large thermal insulation liner for bulk temperature-sensitive shipments. Provides superior thermal protection for extended periods. Ideal for pharmaceutical distribution and cold chain logistics.",
        price: 175.0,
        stock: 150,
        category_id: 5,
        image_url:
          "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=500",
        created_by: 3,
      },
      {
        name: "Foam Insulation Panel",
        short_description: "Rigid foam thermal barrier",
        description:
          "High-performance foam insulation panels for building thermal barriers in packaging. Excellent insulation properties and structural rigidity. Perfect for custom insulated containers.",
        price: 95.0,
        stock: 220,
        category_id: 5,
        image_url:
          "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=500",
        created_by: 3,
      },

      // Paper Pallet
      {
        name: "Paper Pallet - Light Duty",
        short_description: "Eco-friendly lightweight paper pallet",
        description:
          "Environmentally friendly paper pallet for light-duty applications. 100% recyclable and biodegradable. Ideal for retail displays, lightweight products, and sustainable logistics solutions. Load capacity up to 200kg.",
        price: 280.0,
        stock: 120,
        category_id: 6,
        image_url:
          "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500",
        created_by: 3,
      },
      {
        name: "Paper Pallet - Medium Duty",
        short_description: "Sustainable medium-strength pallet",
        description:
          "Medium-duty paper pallet offering excellent strength-to-weight ratio. Perfect for warehousing, export shipping, and one-way trips. Load capacity up to 500kg. ISPM 15 exempt.",
        price: 380.0,
        stock: 100,
        category_id: 6,
        image_url:
          "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500",
        created_by: 3,
      },
      {
        name: "Paper Pallet - Heavy Duty",
        short_description: "High-strength corrugated paper pallet",
        description:
          "Heavy-duty paper pallet with reinforced construction. Supports loads up to 1000kg. Ideal for international shipping, industrial applications, and heavy products. Moisture-resistant coating available.",
        price: 480.0,
        stock: 80,
        category_id: 6,
        image_url:
          "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500",
        created_by: 3,
      },
      {
        name: "Custom Paper Pallet",
        short_description: "Tailored paper pallet solutions",
        description:
          "Custom-designed paper pallet manufactured to your exact specifications. Available in various sizes, load capacities, and configurations. Perfect for specialized logistics requirements and automated handling systems.",
        price: 550.0,
        stock: 70,
        category_id: 6,
        image_url:
          "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500",
        created_by: 3,
      },
    ];

    for (const product of products) {
      await connection.query(
        `INSERT INTO products (name, short_description, description, price, stock, category_id, image_url, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.name,
          product.short_description,
          product.description,
          product.price,
          product.stock,
          product.category_id,
          product.image_url,
          product.created_by,
        ]
      );
    }
    console.log("✓ Products seeded");

    // 5. Seed Bulletins
    console.log("Seeding bulletins...");
    const bulletins = [
      {
        type: "hiring",
        title: "Senior Software Engineer Position",
        short_description: "Join our growing engineering team",
        description:
          "We are seeking an experienced Senior Software Engineer to join our dynamic team. The ideal candidate will have 5+ years of experience in full-stack development, strong problem-solving skills, and passion for building scalable applications. We offer competitive salary, comprehensive benefits, and flexible work arrangements.",
        created_by: 2,
      },
      {
        type: "event",
        title: "Annual Company Celebration 2026",
        short_description: "Celebrate our achievements together",
        description:
          "Join us for our Annual Company Celebration! This year, we will be hosting a gala dinner at the Grand Ballroom with live entertainment, awards ceremony, and team-building activities. It is a great opportunity to connect with colleagues and celebrate our collective success.",
        event_date: "2026-03-15",
        location: "Grand Ballroom, City Convention Center",
        created_by: 2,
      },
      {
        type: "announcement",
        title: "New Product Launch Coming Soon",
        short_description: "Exciting new product announcement",
        description:
          "We are thrilled to announce the upcoming launch of our revolutionary new product line! Stay tuned for more details. This launch represents months of hard work from our team and we cannot wait to share it with you.",
        created_by: 2,
      },
      {
        type: "hiring",
        title: "Marketing Manager Opening",
        short_description: "Lead our marketing initiatives",
        description:
          "We are looking for a creative and strategic Marketing Manager to lead our marketing efforts. Responsibilities include developing marketing strategies, managing campaigns, analyzing market trends, and leading a team of marketing professionals. Excellent communication skills and proven track record required.",
        created_by: 2,
      },
      {
        type: "event",
        title: "Tech Workshop: AI and Machine Learning",
        short_description: "Learn about the latest AI technologies",
        description:
          "Join our technical workshop focused on AI and Machine Learning. Industry experts will share insights on the latest developments, best practices, and practical applications. Open to all employees interested in expanding their technical knowledge.",
        event_date: "2026-02-20",
        location: "Conference Room A, Head Office",
        created_by: 2,
      },
    ];

    for (const bulletin of bulletins) {
      await connection.query(
        `INSERT INTO bulletins (type, title, short_description, description, event_date, location, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          bulletin.type,
          bulletin.title,
          bulletin.short_description,
          bulletin.description,
          bulletin.event_date || null,
          bulletin.location || null,
          bulletin.created_by,
        ]
      );
    }
    console.log("✓ Bulletins seeded");

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\nDefault users created:");
    console.log("Admin: admin@company.com / admin123");
    console.log("HR: hr@company.com / hr123");
    console.log("Sales: sales@company.com / sales123");
    console.log("User: user@company.com / user123");
    console.log("Customer: customer@example.com / customer123");
  } catch (error) {
    console.error("Seeding failed:", error);
    throw error;
  } finally {
    connection.release();
    process.exit(0);
  }
}

seedDatabase().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
