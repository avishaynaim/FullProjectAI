using Microsoft.EntityFrameworkCore;
using TreeViewApp.Models;

namespace TreeViewApp.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<Project> Projects { get; set; }
        public DbSet<Root> Roots { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Field> Fields { get; set; }
        public DbSet<EnumValue> EnumValues { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Define relationships
            modelBuilder
                .Entity<Root>()
                .HasOne(r => r.Project)
                .WithMany(p => p.Roots)
                .HasForeignKey(r => r.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder
                .Entity<Message>()
                .HasOne(m => m.Root)
                .WithMany(r => r.Messages)
                .HasForeignKey(m => m.RootId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder
                .Entity<Field>()
                .HasOne(f => f.Message)
                .WithMany(m => m.Fields)
                .HasForeignKey(f => f.MessageId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder
                .Entity<Field>()
                .HasOne(f => f.ParentField)
                .WithMany(f => f.ChildFields)
                .HasForeignKey(f => f.ParentFieldId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder
                .Entity<EnumValue>()
                .HasOne(e => e.Field)
                .WithMany(f => f.EnumValues)
                .HasForeignKey(e => e.FieldId)
                .OnDelete(DeleteBehavior.Cascade);

            // Seed some initial data
            SeedData(modelBuilder);
        }

// Improved SeedData method for ApplicationDbContext.cs
private void SeedData(ModelBuilder modelBuilder)
{
    // ======== PROJECTS ========
    var project1Id = Guid.NewGuid();
    var project2Id = Guid.NewGuid();
    var project3Id = Guid.NewGuid();

    // ======== ROOTS ========
    // Project 1 Roots
    var root1_1Id = Guid.NewGuid();
    var root1_2Id = Guid.NewGuid();
    var root1_3Id = Guid.NewGuid();
    var root1_4Id = Guid.NewGuid();
    var root1_5Id = Guid.NewGuid();
    var root1_6Id = Guid.NewGuid();
    var root1_7Id = Guid.NewGuid();
    var root1_8Id = Guid.NewGuid();
    var root1_9Id = Guid.NewGuid();
    var root1_10Id = Guid.NewGuid();
    
    // Project 2 Roots
    var root2_1Id = Guid.NewGuid();
    var root2_2Id = Guid.NewGuid();
    var root2_3Id = Guid.NewGuid();
    var root2_4Id = Guid.NewGuid();
    var root2_5Id = Guid.NewGuid();
    var root2_6Id = Guid.NewGuid();
    var root2_7Id = Guid.NewGuid();
    var root2_8Id = Guid.NewGuid();
    var root2_9Id = Guid.NewGuid();
    var root2_10Id = Guid.NewGuid();
    
    // Project 3 Roots
    var root3_1Id = Guid.NewGuid();
    var root3_2Id = Guid.NewGuid();
    var root3_3Id = Guid.NewGuid();
    var root3_4Id = Guid.NewGuid();
    var root3_5Id = Guid.NewGuid();
    var root3_6Id = Guid.NewGuid();
    var root3_7Id = Guid.NewGuid();
    var root3_8Id = Guid.NewGuid();
    var root3_9Id = Guid.NewGuid();
    var root3_10Id = Guid.NewGuid();

    // ======== MESSAGES ========
    // Just declaring some message IDs for roots in Project 1 (for brevity)
    var msg1_1Id = Guid.NewGuid();
    var msg1_2Id = Guid.NewGuid();
    var msg1_3Id = Guid.NewGuid();
    var msg1_4Id = Guid.NewGuid();
    var msg1_5Id = Guid.NewGuid();
    
    // ======== FIELDS ========
    // Just declaring some field IDs for a message in Project 1 (for brevity)
    var field1_1Id = Guid.NewGuid();
    var field1_2Id = Guid.NewGuid();
    var field1_3Id = Guid.NewGuid();
    var field1_4Id = Guid.NewGuid();
    var field1_5Id = Guid.NewGuid();
    
    // Complex field with child fields
    var complexField1Id = Guid.NewGuid();
    var childField1Id = Guid.NewGuid();
    var childField2Id = Guid.NewGuid();
    var childField3Id = Guid.NewGuid();
    var childField4Id = Guid.NewGuid();
    var childField5Id = Guid.NewGuid();
    
    // Nested complex field
    var nestedComplexFieldId = Guid.NewGuid();
    var nestedChild1Id = Guid.NewGuid();
    var nestedChild2Id = Guid.NewGuid();
    var nestedChild3Id = Guid.NewGuid();
    
    // Enum field with values
    var enumFieldId = Guid.NewGuid();
    var enumValue1Id = Guid.NewGuid();
    var enumValue2Id = Guid.NewGuid();
    var enumValue3Id = Guid.NewGuid();
    var enumValue4Id = Guid.NewGuid();
    var enumValue5Id = Guid.NewGuid();

    // =================== SEED PROJECTS ===================
    modelBuilder.Entity<Project>().HasData(
        new Project
        {
            Id = project1Id,
            Name = "API Integration Platform",
            Description = "Comprehensive API integration platform with support for multiple third-party services",
            CreatedDate = DateTime.Now.AddDays(-120),
            LastModifiedDate = DateTime.Now.AddDays(-5),
        },
        new Project
        {
            Id = project2Id,
            Name = "Enterprise E-Commerce System",
            Description = "Scalable B2B/B2C e-commerce system with inventory management and payment processing",
            CreatedDate = DateTime.Now.AddDays(-90),
            LastModifiedDate = DateTime.Now.AddDays(-2),
        },
        new Project
        {
            Id = project3Id,
            Name = "IoT Data Analytics Platform",
            Description = "Real-time data collection and analytics platform for IoT devices and sensors",
            CreatedDate = DateTime.Now.AddDays(-60),
            LastModifiedDate = DateTime.Now.AddDays(-1),
        }
    );

    // =================== SEED ROOTS ===================
    // Project 1 Roots
    modelBuilder.Entity<Root>().HasData(
        new Root
        {
            Id = root1_1Id,
            Name = "Payment Gateway",
            Description = "Integration with multiple payment processors",
            CreatedDate = DateTime.Now.AddDays(-115),
            LastModifiedDate = DateTime.Now.AddDays(-10),
            ProjectId = project1Id,
        },
        new Root
        {
            Id = root1_2Id,
            Name = "Social Media",
            Description = "Social media API integrations",
            CreatedDate = DateTime.Now.AddDays(-110),
            LastModifiedDate = DateTime.Now.AddDays(-9),
            ProjectId = project1Id,
        },
        new Root
        {
            Id = root1_3Id,
            Name = "Email Services",
            Description = "Email delivery and tracking services",
            CreatedDate = DateTime.Now.AddDays(-105),
            LastModifiedDate = DateTime.Now.AddDays(-8),
            ProjectId = project1Id,
        },
        new Root
        {
            Id = root1_4Id,
            Name = "Analytics Services",
            Description = "User behavior and application analytics",
            CreatedDate = DateTime.Now.AddDays(-100),
            LastModifiedDate = DateTime.Now.AddDays(-7),
            ProjectId = project1Id,
        },
        new Root
        {
            Id = root1_5Id,
            Name = "Authentication",
            Description = "OAuth and other authentication providers",
            CreatedDate = DateTime.Now.AddDays(-95),
            LastModifiedDate = DateTime.Now.AddDays(-6),
            ProjectId = project1Id,
        },
        new Root
        {
            Id = root1_6Id,
            Name = "Shipping Services",
            Description = "Shipping and logistics providers",
            CreatedDate = DateTime.Now.AddDays(-90),
            LastModifiedDate = DateTime.Now.AddDays(-5),
            ProjectId = project1Id,
        },
        new Root
        {
            Id = root1_7Id,
            Name = "Mapping Services",
            Description = "Geolocation and mapping providers",
            CreatedDate = DateTime.Now.AddDays(-85),
            LastModifiedDate = DateTime.Now.AddDays(-4),
            ProjectId = project1Id,
        },
        new Root
        {
            Id = root1_8Id,
            Name = "Cloud Storage",
            Description = "Cloud storage and file management",
            CreatedDate = DateTime.Now.AddDays(-80),
            LastModifiedDate = DateTime.Now.AddDays(-3),
            ProjectId = project1Id,
        },
        new Root
        {
            Id = root1_9Id,
            Name = "Messaging Services",
            Description = "SMS and push notification providers",
            CreatedDate = DateTime.Now.AddDays(-75),
            LastModifiedDate = DateTime.Now.AddDays(-2),
            ProjectId = project1Id,
        },
        new Root
        {
            Id = root1_10Id,
            Name = "Data Enrichment",
            Description = "Data enrichment and validation services",
            CreatedDate = DateTime.Now.AddDays(-70),
            LastModifiedDate = DateTime.Now.AddDays(-1),
            ProjectId = project1Id,
        }
    );

    // Project 2 Roots
    modelBuilder.Entity<Root>().HasData(
        new Root
        {
            Id = root2_1Id,
            Name = "Product Catalog",
            Description = "Product information and categorization",
            CreatedDate = DateTime.Now.AddDays(-85),
            LastModifiedDate = DateTime.Now.AddDays(-10),
            ProjectId = project2Id,
        },
        new Root
        {
            Id = root2_2Id,
            Name = "Customer Management",
            Description = "Customer profiles and segmentation",
            CreatedDate = DateTime.Now.AddDays(-84),
            LastModifiedDate = DateTime.Now.AddDays(-9),
            ProjectId = project2Id,
        },
        new Root
        {
            Id = root2_3Id,
            Name = "Order Processing",
            Description = "Order creation and fulfillment",
            CreatedDate = DateTime.Now.AddDays(-83),
            LastModifiedDate = DateTime.Now.AddDays(-8),
            ProjectId = project2Id,
        },
        new Root
        {
            Id = root2_4Id,
            Name = "Inventory Management",
            Description = "Stock levels and inventory tracking",
            CreatedDate = DateTime.Now.AddDays(-82),
            LastModifiedDate = DateTime.Now.AddDays(-7),
            ProjectId = project2Id,
        },
        new Root
        {
            Id = root2_5Id,
            Name = "Payment Processing",
            Description = "Payment methods and transactions",
            CreatedDate = DateTime.Now.AddDays(-81),
            LastModifiedDate = DateTime.Now.AddDays(-6),
            ProjectId = project2Id,
        },
        new Root
        {
            Id = root2_6Id,
            Name = "Shipping",
            Description = "Shipping options and tracking",
            CreatedDate = DateTime.Now.AddDays(-80),
            LastModifiedDate = DateTime.Now.AddDays(-5),
            ProjectId = project2Id,
        },
        new Root
        {
            Id = root2_7Id,
            Name = "Promotions",
            Description = "Discounts and promotional campaigns",
            CreatedDate = DateTime.Now.AddDays(-79),
            LastModifiedDate = DateTime.Now.AddDays(-4),
            ProjectId = project2Id,
        },
        new Root
        {
            Id = root2_8Id,
            Name = "Tax Calculation",
            Description = "Tax rates and calculations",
            CreatedDate = DateTime.Now.AddDays(-78),
            LastModifiedDate = DateTime.Now.AddDays(-3),
            ProjectId = project2Id,
        },
        new Root
        {
            Id = root2_9Id,
            Name = "Returns Management",
            Description = "Return requests and processing",
            CreatedDate = DateTime.Now.AddDays(-77),
            LastModifiedDate = DateTime.Now.AddDays(-2),
            ProjectId = project2Id,
        },
        new Root
        {
            Id = root2_10Id,
            Name = "Reporting",
            Description = "Sales and analytics reporting",
            CreatedDate = DateTime.Now.AddDays(-76),
            LastModifiedDate = DateTime.Now.AddDays(-1),
            ProjectId = project2Id,
        }
    );

    // Project 3 Roots
    modelBuilder.Entity<Root>().HasData(
        new Root
        {
            Id = root3_1Id,
            Name = "Device Registration",
            Description = "IoT device onboarding and registration",
            CreatedDate = DateTime.Now.AddDays(-55),
            LastModifiedDate = DateTime.Now.AddDays(-10),
            ProjectId = project3Id,
        },
        new Root
        {
            Id = root3_2Id,
            Name = "Data Collection",
            Description = "Sensor data collection and normalization",
            CreatedDate = DateTime.Now.AddDays(-54),
            LastModifiedDate = DateTime.Now.AddDays(-9),
            ProjectId = project3Id,
        },
        new Root
        {
            Id = root3_3Id,
            Name = "Real-time Processing",
            Description = "Stream processing of sensor data",
            CreatedDate = DateTime.Now.AddDays(-53),
            LastModifiedDate = DateTime.Now.AddDays(-8),
            ProjectId = project3Id,
        },
        new Root
        {
            Id = root3_4Id,
            Name = "Long-term Storage",
            Description = "Data warehousing for historical analysis",
            CreatedDate = DateTime.Now.AddDays(-52),
            LastModifiedDate = DateTime.Now.AddDays(-7),
            ProjectId = project3Id,
        },
        new Root
        {
            Id = root3_5Id,
            Name = "Alerting System",
            Description = "Anomaly detection and notification",
            CreatedDate = DateTime.Now.AddDays(-51),
            LastModifiedDate = DateTime.Now.AddDays(-6),
            ProjectId = project3Id,
        },
        new Root
        {
            Id = root3_6Id,
            Name = "Visualization",
            Description = "Data visualization and dashboards",
            CreatedDate = DateTime.Now.AddDays(-50),
            LastModifiedDate = DateTime.Now.AddDays(-5),
            ProjectId = project3Id,
        },
        new Root
        {
            Id = root3_7Id,
            Name = "Predictive Analytics",
            Description = "Machine learning for predictive insights",
            CreatedDate = DateTime.Now.AddDays(-49),
            LastModifiedDate = DateTime.Now.AddDays(-4),
            ProjectId = project3Id,
        },
        new Root
        {
            Id = root3_8Id,
            Name = "Device Management",
            Description = "Remote configuration and updates",
            CreatedDate = DateTime.Now.AddDays(-48),
            LastModifiedDate = DateTime.Now.AddDays(-3),
            ProjectId = project3Id,
        },
        new Root
        {
            Id = root3_9Id,
            Name = "User Access",
            Description = "User permissions and authentication",
            CreatedDate = DateTime.Now.AddDays(-47),
            LastModifiedDate = DateTime.Now.AddDays(-2),
            ProjectId = project3Id,
        },
        new Root
        {
            Id = root3_10Id,
            Name = "API Services",
            Description = "External API integration for IoT platform",
            CreatedDate = DateTime.Now.AddDays(-46),
            LastModifiedDate = DateTime.Now.AddDays(-1),
            ProjectId = project3Id,
        }
    );

    // =================== SEED MESSAGES ===================
    // Just adding messages for one root as an example (would be repeated for each root)
    modelBuilder.Entity<Message>().HasData(
        new Message
        {
            Id = msg1_1Id,
            Name = "Process Payment",
            Description = "Request to process a payment transaction",
            CreatedDate = DateTime.Now.AddDays(-114),
            LastModifiedDate = DateTime.Now.AddDays(-10),
            RootId = root1_1Id,
        },
        new Message
        {
            Id = msg1_2Id,
            Name = "Payment Response",
            Description = "Response from payment processor",
            CreatedDate = DateTime.Now.AddDays(-113),
            LastModifiedDate = DateTime.Now.AddDays(-9),
            RootId = root1_1Id,
        },
        new Message
        {
            Id = msg1_3Id,
            Name = "Payment Refund",
            Description = "Request to refund a processed payment",
            CreatedDate = DateTime.Now.AddDays(-112),
            LastModifiedDate = DateTime.Now.AddDays(-8),
            RootId = root1_1Id,
        },
        new Message
        {
            Id = msg1_4Id,
            Name = "Refund Response",
            Description = "Response from payment processor for refund",
            CreatedDate = DateTime.Now.AddDays(-111),
            LastModifiedDate = DateTime.Now.AddDays(-7),
            RootId = root1_1Id,
        },
        new Message
        {
            Id = msg1_5Id,
            Name = "Payment Status",
            Description = "Request to check payment status",
            CreatedDate = DateTime.Now.AddDays(-110),
            LastModifiedDate = DateTime.Now.AddDays(-6),
            RootId = root1_1Id,
        }
    );

    // =================== SEED FIELDS ===================
    // Regular fields for a message
    modelBuilder.Entity<Field>().HasData(
        new Field
        {
            Id = field1_1Id,
            Name = "Amount",
            Description = "Payment amount in smallest currency unit",
            Type = FieldType.Decimal,
            DefaultValue = "0",
            IsRequired = true,
            CreatedDate = DateTime.Now.AddDays(-114),
            LastModifiedDate = DateTime.Now.AddDays(-10),
            MessageId = msg1_1Id,
            ParentFieldId = null
        },
        new Field
        {
            Id = field1_2Id,
            Name = "Currency",
            Description = "Three-letter currency code (ISO 4217)",
            Type = FieldType.String,
            DefaultValue = "USD",
            IsRequired = true,
            CreatedDate = DateTime.Now.AddDays(-114),
            LastModifiedDate = DateTime.Now.AddDays(-10),
            MessageId = msg1_1Id,
            ParentFieldId = null
        },
        new Field
        {
            Id = field1_3Id,
            Name = "TransactionId",
            Description = "Unique identifier for the transaction",
            Type = FieldType.String,
            DefaultValue = "",
            IsRequired = true,
            CreatedDate = DateTime.Now.AddDays(-114),
            LastModifiedDate = DateTime.Now.AddDays(-10),
            MessageId = msg1_1Id,
            ParentFieldId = null
        },
        new Field
        {
            Id = field1_4Id,
            Name = "Description",
            Description = "Payment description",
            Type = FieldType.String,
            DefaultValue = "",
            IsRequired = false,
            CreatedDate = DateTime.Now.AddDays(-114),
            LastModifiedDate = DateTime.Now.AddDays(-10),
            MessageId = msg1_1Id,
            ParentFieldId = null
        },
        new Field
        {
            Id = field1_5Id,
            Name = "Timestamp",
            Description = "Transaction timestamp",
            Type = FieldType.DateTime,
            DefaultValue = "",
            IsRequired = true,
            CreatedDate = DateTime.Now.AddDays(-114),
            LastModifiedDate = DateTime.Now.AddDays(-10),
            MessageId = msg1_1Id,
            ParentFieldId = null
        }
    );

    // Complex field with child fields
    modelBuilder.Entity<Field>().HasData(
        new Field
        {
            Id = complexField1Id,
            Name = "Customer",
            Description = "Customer information",
            Type = FieldType.Complex,
            DefaultValue = "",
            IsRequired = true,
            CreatedDate = DateTime.Now.AddDays(-114),
            LastModifiedDate = DateTime.Now.AddDays(-10),
            MessageId = msg1_1Id,
            ParentFieldId = null
        },
        // Child fields for Customer complex field
        new Field
        {
            Id = childField1Id,
            Name = "FirstName",
            Description = "Customer first name",
            Type = FieldType.String,
            DefaultValue = "",
            IsRequired = true,
            CreatedDate = DateTime.Now.AddDays(-114),
            LastModifiedDate = DateTime.Now.AddDays(-10),
            MessageId = null,
            ParentFieldId = complexField1Id
        },
        new Field
        {
            Id = childField2Id,
            Name = "LastName",
            Description = "Customer last name",
            Type = FieldType.String,
            DefaultValue = "",
            IsRequired = true,
            CreatedDate = DateTime.Now.AddDays(-114),
            LastModifiedDate = DateTime.Now.AddDays(-10),
            MessageId = null,
            ParentFieldId = complexField1Id
        },
        new Field
        {
            Id = childField3Id,
            Name = "Email",
            Description = "Customer email address",
            Type = FieldType.String,
            DefaultValue = "",
            IsRequired = true,
            CreatedDate = DateTime.Now.AddDays(-114),
            LastModifiedDate = DateTime.Now.AddDays(-10),
            MessageId = null,
            ParentFieldId = complexField1Id
        },
        new Field
        {
            Id = childField4Id,
            Name = "Phone",
            Description = "Customer phone number",
            Type = FieldType.String,
            DefaultValue = "",
            IsRequired = false,
            CreatedDate = DateTime.Now.AddDays(-114),
            LastModifiedDate = DateTime.Now.AddDays(-10),
            MessageId = null,
            ParentFieldId = complexField1Id
        },
        // Nested complex field (Address under Customer)
        new Field
        {
            Id = childField5Id,
            Name = "Address",
            Description = "Customer address information",
            Type = FieldType.Complex,
            DefaultValue = "",
            IsRequired = false,
            CreatedDate = DateTime.Now.AddDays(-114),
            LastModifiedDate = DateTime.Now.AddDays(-10),
            MessageId = null,
            ParentFieldId = complexField1Id
        },
        // Nested child fields for Address
        new Field
        {
            Id = nestedComplexFieldId,
            Name = "ShippingAddress",
            Description = "Customer shipping address",
            Type = FieldType.Complex,
            DefaultValue = "",
            IsRequired = false,
            CreatedDate = DateTime.Now.AddDays(-114),
            LastModifiedDate = DateTime.Now.AddDays(-10),
            MessageId = null,
            ParentFieldId = childField5Id
        },
        new Field
        {
            Id = nestedChild1Id,
            Name = "Street",
            Description = "Street address",
            Type = FieldType.String,
            DefaultValue = "",
            IsRequired = true,
            CreatedDate = DateTime.Now.AddDays(-114),
            LastModifiedDate = DateTime.Now.AddDays(-10),
            MessageId = null,
            ParentFieldId = nestedComplexFieldId
        },
        new Field
        {
            Id = nestedChild2Id,
            Name = "City",
            Description = "City",
            Type = FieldType.String,
            DefaultValue = "",
            IsRequired = true,
            CreatedDate = DateTime.Now.AddDays(-114),
            LastModifiedDate = DateTime.Now.AddDays(-10),
            MessageId = null,
            ParentFieldId = nestedComplexFieldId
        },
        new Field
        {
            Id = nestedChild3Id,
            Name = "PostalCode",
            Description = "Postal code / ZIP",
            Type = FieldType.String,
            DefaultValue = "",
            IsRequired = true,
            CreatedDate = DateTime.Now.AddDays(-114),
            LastModifiedDate = DateTime.Now.AddDays(-10),
            MessageId = null,
            ParentFieldId = nestedComplexFieldId
        }
    );

    // Enum field with values
    modelBuilder.Entity<Field>().HasData(
        new Field
        {
            Id = enumFieldId,
            Name = "PaymentMethod",
            Description = "Method of payment",
            Type = FieldType.Enum,
            DefaultValue = "CreditCard",
            IsRequired = true,
            CreatedDate = DateTime.Now.AddDays(-114),
            LastModifiedDate = DateTime.Now.AddDays(-10),
            MessageId = msg1_1Id,
            ParentFieldId = null
        }
    );
    
    // Enum values for PaymentMethod
    modelBuilder.Entity<EnumValue>().HasData(
        new EnumValue
        {
            Id = enumValue1Id,
            Name = "Credit Card",
            Value = "CreditCard",
            Description = "Payment using credit card",
            FieldId = enumFieldId
        },
        new EnumValue
        {
            Id = enumValue2Id,
            Name = "Debit Card",
            Value = "DebitCard",
            Description = "Payment using debit card",
            FieldId = enumFieldId
        },
        new EnumValue
        {
            Id = enumValue3Id,
            Name = "Bank Transfer",
            Value = "BankTransfer",
            Description = "Direct bank transfer payment",
            FieldId = enumFieldId
        },
        new EnumValue
        {
            Id = enumValue4Id,
            Name = "Digital Wallet",
            Value = "DigitalWallet",
            Description = "Payment using digital wallet (PayPal, Apple Pay, etc.)",
            FieldId = enumFieldId
        },
        new EnumValue
        {
            Id = enumValue5Id,
            Name = "Cryptocurrency",
            Value = "Cryptocurrency",
            Description = "Payment using cryptocurrency",
            FieldId = enumFieldId
        }
    );
    
    // Additional messages and their fields would be seeded here following similar patterns
    // We would repeat this for all roots in all projects for a complete seed
}
    }
}
