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
  // Project GUIDs
 Guid project1Id = new Guid("00000000-0000-0000-0000-000000000001");
 Guid project2Id = new Guid("00000000-0000-0000-0000-000000000002");
 Guid project3Id = new Guid("00000000-0000-0000-0000-000000000003");

// ======== ROOTS ========
// Project 1 Roots
 Guid root1_1Id = new Guid("00000000-0000-0000-0000-000000000101");
 Guid root1_2Id = new Guid("00000000-0000-0000-0000-000000000102");
 Guid root1_3Id = new Guid("00000000-0000-0000-0000-000000000103");
 Guid root1_4Id = new Guid("00000000-0000-0000-0000-000000000104");
 Guid root1_5Id = new Guid("00000000-0000-0000-0000-000000000105");
 Guid root1_6Id = new Guid("00000000-0000-0000-0000-000000000106");
 Guid root1_7Id = new Guid("00000000-0000-0000-0000-000000000107");
 Guid root1_8Id = new Guid("00000000-0000-0000-0000-000000000108");
 Guid root1_9Id = new Guid("00000000-0000-0000-0000-000000000109");
 Guid root1_10Id = new Guid("00000000-0000-0000-0000-00000000010A");

// Project 2 Roots
 Guid root2_1Id = new Guid("00000000-0000-0000-0000-000000000201");
 Guid root2_2Id = new Guid("00000000-0000-0000-0000-000000000202");
 Guid root2_3Id = new Guid("00000000-0000-0000-0000-000000000203");
 Guid root2_4Id = new Guid("00000000-0000-0000-0000-000000000204");
 Guid root2_5Id = new Guid("00000000-0000-0000-0000-000000000205");
 Guid root2_6Id = new Guid("00000000-0000-0000-0000-000000000206");
 Guid root2_7Id = new Guid("00000000-0000-0000-0000-000000000207");
 Guid root2_8Id = new Guid("00000000-0000-0000-0000-000000000208");
 Guid root2_9Id = new Guid("00000000-0000-0000-0000-000000000209");
 Guid root2_10Id = new Guid("00000000-0000-0000-0000-00000000020A");

// Project 3 Roots
 Guid root3_1Id = new Guid("00000000-0000-0000-0000-000000000301");
 Guid root3_2Id = new Guid("00000000-0000-0000-0000-000000000302");
 Guid root3_3Id = new Guid("00000000-0000-0000-0000-000000000303");
 Guid root3_4Id = new Guid("00000000-0000-0000-0000-000000000304");
 Guid root3_5Id = new Guid("00000000-0000-0000-0000-000000000305");
 Guid root3_6Id = new Guid("00000000-0000-0000-0000-000000000306");
 Guid root3_7Id = new Guid("00000000-0000-0000-0000-000000000307");
 Guid root3_8Id = new Guid("00000000-0000-0000-0000-000000000308");
 Guid root3_9Id = new Guid("00000000-0000-0000-0000-000000000309");
 Guid root3_10Id = new Guid("00000000-0000-0000-0000-00000000030A");

// ======== MESSAGES ========
// Just declaring some message IDs for roots in Project 1 (for brevity)
 Guid msg1_1Id = new Guid("00000000-0000-0000-0000-000000000401");
 Guid msg1_2Id = new Guid("00000000-0000-0000-0000-000000000402");
 Guid msg1_3Id = new Guid("00000000-0000-0000-0000-000000000403");
 Guid msg1_4Id = new Guid("00000000-0000-0000-0000-000000000404");
 Guid msg1_5Id = new Guid("00000000-0000-0000-0000-000000000405");

// ======== FIELDS ========
// Just declaring some field IDs for a message in Project 1 (for brevity)
 Guid field1_1Id = new Guid("00000000-0000-0000-0000-000000000501");
 Guid field1_2Id = new Guid("00000000-0000-0000-0000-000000000502");
 Guid field1_3Id = new Guid("00000000-0000-0000-0000-000000000503");
 Guid field1_4Id = new Guid("00000000-0000-0000-0000-000000000504");
 Guid field1_5Id = new Guid("00000000-0000-0000-0000-000000000505");

// Complex field with child fields
 Guid complexField1Id = new Guid("00000000-0000-0000-0000-000000000601");
 Guid childField1Id = new Guid("00000000-0000-0000-0000-000000000602");
 Guid childField2Id = new Guid("00000000-0000-0000-0000-000000000603");
 Guid childField3Id = new Guid("00000000-0000-0000-0000-000000000604");
 Guid childField4Id = new Guid("00000000-0000-0000-0000-000000000605");
 Guid childField5Id = new Guid("00000000-0000-0000-0000-000000000606");

// Nested complex field
 Guid nestedComplexFieldId = new Guid("00000000-0000-0000-0000-000000000701");
 Guid nestedChild1Id = new Guid("00000000-0000-0000-0000-000000000702");
 Guid nestedChild2Id = new Guid("00000000-0000-0000-0000-000000000703");
 Guid nestedChild3Id = new Guid("00000000-0000-0000-0000-000000000704");

// Enum field with values
 Guid enumFieldId = new Guid("00000000-0000-0000-0000-000000000801");
 Guid enumValue1Id = new Guid("00000000-0000-0000-0000-000000000802");
 Guid enumValue2Id = new Guid("00000000-0000-0000-0000-000000000803");
 Guid enumValue3Id = new Guid("00000000-0000-0000-0000-000000000804");
 Guid enumValue4Id = new Guid("00000000-0000-0000-0000-000000000805");
 Guid enumValue5Id = new Guid("00000000-0000-0000-0000-000000000806");

    // =================== SEED PROJECTS ===================
  modelBuilder.Entity<Project>().HasData(
        new Project
        {
            Id = project1Id,
            Name = "API Integration Platform",
            Description = "Comprehensive API integration platform with support for multiple third-party services",
            CreatedDate = new DateTime(2024, 11, 20), // Fixed date instead of DateTime.Now.AddDays(-120)
            LastModifiedDate = new DateTime(2025, 3, 14), // Fixed date instead of DateTime.Now.AddDays(-5)
        },
        new Project
        {
            Id = project2Id,
            Name = "Enterprise E-Commerce System",
            Description = "Scalable B2B/B2C e-commerce system with inventory management and payment processing",
            CreatedDate = new DateTime(2024, 12, 20), // Fixed date instead of DateTime.Now.AddDays(-90)
            LastModifiedDate = new DateTime(2025, 3, 17), // Fixed date instead of DateTime.Now.AddDays(-2)
        },
        new Project
        {
            Id = project3Id,
            Name = "IoT Data Analytics Platform",
            Description = "Real-time data collection and analytics platform for IoT devices and sensors",
            CreatedDate = new DateTime(2025, 1, 19), // Fixed date instead of DateTime.Now.AddDays(-60)
            LastModifiedDate = new DateTime(2025, 3, 18), // Fixed date instead of DateTime.Now.AddDays(-1)
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
            CreatedDate = new DateTime(2024, 11, 25), // Fixed date instead of DateTime.Now.AddDays(-115)
            LastModifiedDate = new DateTime(2025, 3, 9), // Fixed date instead of DateTime.Now.AddDays(-10)
            ProjectId = project1Id,
        },
        new Root
        {
            Id = root1_2Id,
            Name = "Social Media",
            Description = "Social media API integrations",
            CreatedDate = new DateTime(2024, 11, 30), // Fixed date instead of DateTime.Now.AddDays(-110)
            LastModifiedDate = new DateTime(2025, 3, 10), // Fixed date instead of DateTime.Now.AddDays(-9)
            ProjectId = project1Id,
        },
        new Root
        {
            Id = root1_3Id,
            Name = "Email Services",
            Description = "Email delivery and tracking services",
            CreatedDate = new DateTime(2024, 12, 5), // Fixed date instead of DateTime.Now.AddDays(-105)
            LastModifiedDate = new DateTime(2025, 3, 11), // Fixed date instead of DateTime.Now.AddDays(-8)
            ProjectId = project1Id,
        },
        new Root
        {
            Id = root1_4Id,
            Name = "Analytics Services",
            Description = "User behavior and application analytics",
            CreatedDate = new DateTime(2024, 12, 10), // Fixed date instead of DateTime.Now.AddDays(-100)
            LastModifiedDate = new DateTime(2025, 3, 12), // Fixed date instead of DateTime.Now.AddDays(-7)
            ProjectId = project1Id,
        },
        new Root
        {
            Id = root1_5Id,
            Name = "Authentication",
            Description = "OAuth and other authentication providers",
            CreatedDate = new DateTime(2024, 12, 15), // Fixed date instead of DateTime.Now.AddDays(-95)
            LastModifiedDate = new DateTime(2025, 3, 13), // Fixed date instead of DateTime.Now.AddDays(-6)
            ProjectId = project1Id,
        },
        new Root
        {
            Id = root1_6Id,
            Name = "Shipping Services",
            Description = "Shipping and logistics providers",
            CreatedDate = new DateTime(2024, 12, 20), // Fixed date instead of DateTime.Now.AddDays(-90)
            LastModifiedDate = new DateTime(2025, 3, 14), // Fixed date instead of DateTime.Now.AddDays(-5)
            ProjectId = project1Id,
        },
        new Root
        {
            Id = root1_7Id,
            Name = "Mapping Services",
            Description = "Geolocation and mapping providers",
            CreatedDate = new DateTime(2024, 12, 25), // Fixed date instead of DateTime.Now.AddDays(-85)
            LastModifiedDate = new DateTime(2025, 3, 15), // Fixed date instead of DateTime.Now.AddDays(-4)
            ProjectId = project1Id,
        },
        new Root
        {
            Id = root1_8Id,
            Name = "Cloud Storage",
            Description = "Cloud storage and file management",
            CreatedDate = new DateTime(2024, 12, 30), // Fixed date instead of DateTime.Now.AddDays(-80)
            LastModifiedDate = new DateTime(2025, 3, 16), // Fixed date instead of DateTime.Now.AddDays(-3)
            ProjectId = project1Id,
        },
        new Root
        {
            Id = root1_9Id,
            Name = "Messaging Services",
            Description = "SMS and push notification providers",
            CreatedDate = new DateTime(2025, 1, 4), // Fixed date instead of DateTime.Now.AddDays(-75)
            LastModifiedDate = new DateTime(2025, 3, 17), // Fixed date instead of DateTime.Now.AddDays(-2)
            ProjectId = project1Id,
        },
        new Root
        {
            Id = root1_10Id,
            Name = "Data Enrichment",
            Description = "Data enrichment and validation services",
            CreatedDate = new DateTime(2025, 1, 9), // Fixed date instead of DateTime.Now.AddDays(-70)
            LastModifiedDate = new DateTime(2025, 3, 18), // Fixed date instead of DateTime.Now.AddDays(-1)
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
            CreatedDate = new DateTime(2024, 12, 25), // Fixed date instead of DateTime.Now.AddDays(-85)
            LastModifiedDate = new DateTime(2025, 3, 9), // Fixed date instead of DateTime.Now.AddDays(-10)
            ProjectId = project2Id,
        },
        new Root
        {
            Id = root2_2Id,
            Name = "Customer Management",
            Description = "Customer profiles and segmentation",
            CreatedDate = new DateTime(2024, 12, 26), // Fixed date instead of DateTime.Now.AddDays(-84)
            LastModifiedDate = new DateTime(2025, 3, 10), // Fixed date instead of DateTime.Now.AddDays(-9)
            ProjectId = project2Id,
        },
        new Root
        {
            Id = root2_3Id,
            Name = "Order Processing",
            Description = "Order creation and fulfillment",
            CreatedDate = new DateTime(2024, 12, 27), // Fixed date instead of DateTime.Now.AddDays(-83)
            LastModifiedDate = new DateTime(2025, 3, 11), // Fixed date instead of DateTime.Now.AddDays(-8)
            ProjectId = project2Id,
        },
        new Root
        {
            Id = root2_4Id,
            Name = "Inventory Management",
            Description = "Stock levels and inventory tracking",
            CreatedDate = new DateTime(2024, 12, 28), // Fixed date instead of DateTime.Now.AddDays(-82)
            LastModifiedDate = new DateTime(2025, 3, 12), // Fixed date instead of DateTime.Now.AddDays(-7)
            ProjectId = project2Id,
        },
        new Root
        {
            Id = root2_5Id,
            Name = "Payment Processing",
            Description = "Payment methods and transactions",
            CreatedDate = new DateTime(2024, 12, 29), // Fixed date instead of DateTime.Now.AddDays(-81)
            LastModifiedDate = new DateTime(2025, 3, 13), // Fixed date instead of DateTime.Now.AddDays(-6)
            ProjectId = project2Id,
        },
        new Root
        {
            Id = root2_6Id,
            Name = "Shipping",
            Description = "Shipping options and tracking",
            CreatedDate = new DateTime(2024, 12, 30), // Fixed date instead of DateTime.Now.AddDays(-80)
            LastModifiedDate = new DateTime(2025, 3, 14), // Fixed date instead of DateTime.Now.AddDays(-5)
            ProjectId = project2Id,
        },
        new Root
        {
            Id = root2_7Id,
            Name = "Promotions",
            Description = "Discounts and promotional campaigns",
            CreatedDate = new DateTime(2024, 12, 31), // Fixed date instead of DateTime.Now.AddDays(-79)
            LastModifiedDate = new DateTime(2025, 3, 15), // Fixed date instead of DateTime.Now.AddDays(-4)
            ProjectId = project2Id,
        },
        new Root
        {
            Id = root2_8Id,
            Name = "Tax Calculation",
            Description = "Tax rates and calculations",
            CreatedDate = new DateTime(2025, 1, 1), // Fixed date instead of DateTime.Now.AddDays(-78)
            LastModifiedDate = new DateTime(2025, 3, 16), // Fixed date instead of DateTime.Now.AddDays(-3)
            ProjectId = project2Id,
        },
        new Root
        {
            Id = root2_9Id,
            Name = "Returns Management",
            Description = "Return requests and processing",
            CreatedDate = new DateTime(2025, 1, 2), // Fixed date instead of DateTime.Now.AddDays(-77)
            LastModifiedDate = new DateTime(2025, 3, 17), // Fixed date instead of DateTime.Now.AddDays(-2)
            ProjectId = project2Id,
        },
        new Root
        {
            Id = root2_10Id,
            Name = "Reporting",
            Description = "Sales and analytics reporting",
            CreatedDate = new DateTime(2025, 1, 3), // Fixed date instead of DateTime.Now.AddDays(-76)
            LastModifiedDate = new DateTime(2025, 3, 18), // Fixed date instead of DateTime.Now.AddDays(-1)
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
            CreatedDate = new DateTime(2025, 1, 24), // Fixed date instead of DateTime.Now.AddDays(-55)
            LastModifiedDate = new DateTime(2025, 3, 9), // Fixed date instead of DateTime.Now.AddDays(-10)
            ProjectId = project3Id,
        },
        new Root
        {
            Id = root3_2Id,
            Name = "Data Collection",
            Description = "Sensor data collection and normalization",
            CreatedDate = new DateTime(2025, 1, 25), // Fixed date instead of DateTime.Now.AddDays(-54)
            LastModifiedDate = new DateTime(2025, 3, 10), // Fixed date instead of DateTime.Now.AddDays(-9)
            ProjectId = project3Id,
        },
        new Root
        {
            Id = root3_3Id,
            Name = "Real-time Processing",
            Description = "Stream processing of sensor data",
            CreatedDate = new DateTime(2025, 1, 26), // Fixed date instead of DateTime.Now.AddDays(-53)
            LastModifiedDate = new DateTime(2025, 3, 11), // Fixed date instead of DateTime.Now.AddDays(-8)
            ProjectId = project3Id,
        },
        new Root
        {
            Id = root3_4Id,
            Name = "Long-term Storage",
            Description = "Data warehousing for historical analysis",
            CreatedDate = new DateTime(2025, 1, 27), // Fixed date instead of DateTime.Now.AddDays(-52)
            LastModifiedDate = new DateTime(2025, 3, 12), // Fixed date instead of DateTime.Now.AddDays(-7)
            ProjectId = project3Id,
        },
        new Root
        {
            Id = root3_5Id,
            Name = "Alerting System",
            Description = "Anomaly detection and notification",
            CreatedDate = new DateTime(2025, 1, 28), // Fixed date instead of DateTime.Now.AddDays(-51)
            LastModifiedDate = new DateTime(2025, 3, 13), // Fixed date instead of DateTime.Now.AddDays(-6)
            ProjectId = project3Id,
        },
        new Root
        {
            Id = root3_6Id,
            Name = "Visualization",
            Description = "Data visualization and dashboards",
            CreatedDate = new DateTime(2025, 1, 29), // Fixed date instead of DateTime.Now.AddDays(-50)
            LastModifiedDate = new DateTime(2025, 3, 14), // Fixed date instead of DateTime.Now.AddDays(-5)
            ProjectId = project3Id,
        },
        new Root
        {
            Id = root3_7Id,
            Name = "Predictive Analytics",
            Description = "Machine learning for predictive insights",
            CreatedDate = new DateTime(2025, 1, 30), // Fixed date instead of DateTime.Now.AddDays(-49)
            LastModifiedDate = new DateTime(2025, 3, 15), // Fixed date instead of DateTime.Now.AddDays(-4)
            ProjectId = project3Id,
        },
        new Root
        {
            Id = root3_8Id,
            Name = "Device Management",
            Description = "Remote configuration and updates",
            CreatedDate = new DateTime(2025, 1, 31), // Fixed date instead of DateTime.Now.AddDays(-48)
            LastModifiedDate = new DateTime(2025, 3, 16), // Fixed date instead of DateTime.Now.AddDays(-3)
            ProjectId = project3Id,
        },
        new Root
        {
            Id = root3_9Id,
            Name = "User Access",
            Description = "User permissions and authentication",
            CreatedDate = new DateTime(2025, 2, 1), // Fixed date instead of DateTime.Now.AddDays(-47)
            LastModifiedDate = new DateTime(2025, 3, 17), // Fixed date instead of DateTime.Now.AddDays(-2)
            ProjectId = project3Id,
        },
        new Root
        {
            Id = root3_10Id,
            Name = "API Services",
            Description = "External API integration for IoT platform",
            CreatedDate = new DateTime(2025, 2, 2), // Fixed date instead of DateTime.Now.AddDays(-46)
            LastModifiedDate = new DateTime(2025, 3, 18), // Fixed date instead of DateTime.Now.AddDays(-1)
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
            CreatedDate = new DateTime(2024, 11, 26), // Fixed date instead of DateTime.Now.AddDays(-114)
            LastModifiedDate = new DateTime(2025, 3, 9), // Fixed date instead of DateTime.Now.AddDays(-10)
            RootId = root1_1Id,
        },
        new Message
        {
            Id = msg1_2Id,
            Name = "Payment Response",
            Description = "Response from payment processor",
            CreatedDate = new DateTime(2024, 11, 27), // Fixed date instead of DateTime.Now.AddDays(-113)
            LastModifiedDate = new DateTime(2025, 3, 10), // Fixed date instead of DateTime.Now.AddDays(-9)
            RootId = root1_1Id,
        },
        new Message
        {
            Id = msg1_3Id,
            Name = "Payment Refund",
            Description = "Request to refund a processed payment",
            CreatedDate = new DateTime(2024, 11, 28), // Fixed date instead of DateTime.Now.AddDays(-112)
            LastModifiedDate = new DateTime(2025, 3, 11), // Fixed date instead of DateTime.Now.AddDays(-8)
            RootId = root1_1Id,
        },
        new Message
        {
            Id = msg1_4Id,
            Name = "Refund Response",
            Description = "Response from payment processor for refund",
            CreatedDate = new DateTime(2024, 11, 29), // Fixed date instead of DateTime.Now.AddDays(-111)
            LastModifiedDate = new DateTime(2025, 3, 12), // Fixed date instead of DateTime.Now.AddDays(-7)
            RootId = root1_1Id,
        },
        new Message
        {
            Id = msg1_5Id,
            Name = "Payment Status",
            Description = "Request to check payment status",
            CreatedDate = new DateTime(2024, 11, 30), // Fixed date instead of DateTime.Now.AddDays(-110)
            LastModifiedDate = new DateTime(2025, 3, 13), // Fixed date instead of DateTime.Now.AddDays(-6)
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
            CreatedDate = new DateTime(2024, 11, 26), // Fixed date instead of DateTime.Now.AddDays(-114)
            LastModifiedDate = new DateTime(2025, 3, 9), // Fixed date instead of DateTime.Now.AddDays(-10)
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
            CreatedDate = new DateTime(2024, 11, 26), // Fixed date instead of DateTime.Now.AddDays(-114)
            LastModifiedDate = new DateTime(2025, 3, 9), // Fixed date instead of DateTime.Now.AddDays(-10)
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
            CreatedDate = new DateTime(2024, 11, 26), // Fixed date instead of DateTime.Now.AddDays(-114)
            LastModifiedDate = new DateTime(2025, 3, 9), // Fixed date instead of DateTime.Now.AddDays(-10)
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
            CreatedDate = new DateTime(2024, 11, 26), // Fixed date instead of DateTime.Now.AddDays(-114)
            LastModifiedDate = new DateTime(2025, 3, 9), // Fixed date instead of DateTime.Now.AddDays(-10)
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
            CreatedDate = new DateTime(2024, 11, 26), // Fixed date instead of DateTime.Now.AddDays(-114)
            LastModifiedDate = new DateTime(2025, 3, 9), // Fixed date instead of DateTime.Now.AddDays(-10)
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
            CreatedDate = new DateTime(2024, 11, 26), // Fixed date instead of DateTime.Now.AddDays(-114)
            LastModifiedDate = new DateTime(2025, 3, 9), // Fixed date instead of DateTime.Now.AddDays(-10)
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
            CreatedDate = new DateTime(2024, 11, 26), // Fixed date instead of DateTime.Now.AddDays(-114)
            LastModifiedDate = new DateTime(2025, 3, 9), // Fixed date instead of DateTime.Now.AddDays(-10)
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
            CreatedDate = new DateTime(2024, 11, 26), // Fixed date instead of DateTime.Now.AddDays(-114)
            LastModifiedDate = new DateTime(2025, 3, 9), // Fixed date instead of DateTime.Now.AddDays(-10)
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
            CreatedDate = new DateTime(2024, 11, 26), // Fixed date instead of DateTime.Now.AddDays(-114)
            LastModifiedDate = new DateTime(2025, 3, 9), // Fixed date instead of DateTime.Now.AddDays(-10)
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
            CreatedDate = new DateTime(2024, 11, 26), // Fixed date instead of DateTime.Now.AddDays(-114)
            LastModifiedDate = new DateTime(2025, 3, 9), // Fixed date instead of DateTime.Now.AddDays(-10)
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
            CreatedDate = new DateTime(2024, 11, 26), // Fixed date instead of DateTime.Now.AddDays(-114)
            LastModifiedDate = new DateTime(2025, 3, 9), // Fixed date instead of DateTime.Now.AddDays(-10)
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
            CreatedDate = new DateTime(2024, 11, 26), // Fixed date instead of DateTime.Now.AddDays(-114)
            LastModifiedDate = new DateTime(2025, 3, 9), // Fixed date instead of DateTime.Now.AddDays(-10)
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
            CreatedDate = new DateTime(2024, 11, 26), // Fixed date instead of DateTime.Now.AddDays(-114)
            LastModifiedDate = new DateTime(2025, 3, 9), // Fixed date instead of DateTime.Now.AddDays(-10)
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
            CreatedDate = new DateTime(2024, 11, 26), // Fixed date instead of DateTime.Now.AddDays(-114)
            LastModifiedDate = new DateTime(2025, 3, 9), // Fixed date instead of DateTime.Now.AddDays(-10)
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
            CreatedDate = new DateTime(2024, 11, 26), // Fixed date instead of DateTime.Now.AddDays(-114)
            LastModifiedDate = new DateTime(2025, 3, 9), // Fixed date instead of DateTime.Now.AddDays(-10)
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
            CreatedDate = new DateTime(2024, 11, 26), // Fixed date instead of DateTime.Now.AddDays(-114)
            LastModifiedDate = new DateTime(2025, 3, 9), // Fixed date instead of DateTime.Now.AddDays(-10)
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
