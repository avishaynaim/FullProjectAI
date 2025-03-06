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

        private void SeedData(ModelBuilder modelBuilder)
{
    // Create some project IDs
    var project1Id = Guid.NewGuid();
    var project2Id = Guid.NewGuid();
    
    // Create some root IDs
    var root1Id = Guid.NewGuid();
    var root2Id = Guid.NewGuid();
    var root3Id = Guid.NewGuid();
    
    // Create some message IDs
    var message1Id = Guid.NewGuid();
    var message2Id = Guid.NewGuid();
    var message3Id = Guid.NewGuid();
    var message4Id = Guid.NewGuid();
    
    // Create some field IDs
    var field1Id = Guid.NewGuid();
    var field2Id = Guid.NewGuid();
    var field3Id = Guid.NewGuid();
    var field4Id = Guid.NewGuid();
    var field5Id = Guid.NewGuid();
    var field6Id = Guid.NewGuid();
    var field7Id = Guid.NewGuid();
    var field8Id = Guid.NewGuid();
    
    // Create some enum value IDs
    var enumValue1Id = Guid.NewGuid();
    var enumValue2Id = Guid.NewGuid();
    var enumValue3Id = Guid.NewGuid();
    var enumValue4Id = Guid.NewGuid();
    var enumValue5Id = Guid.NewGuid();

    // Seed Projects
    modelBuilder.Entity<Project>().HasData(
        new Project
        {
            Id = project1Id,
            Name = "API Integration Project",
            Description = "Project for integrating with third-party APIs",
            CreatedDate = DateTime.Now.AddDays(-30),
            LastModifiedDate = DateTime.Now.AddDays(-2),
        },
        new Project
        {
            Id = project2Id,
            Name = "E-Commerce System",
            Description = "Online shopping platform with customer and admin portals",
            CreatedDate = DateTime.Now.AddDays(-60),
            LastModifiedDate = DateTime.Now.AddDays(-5),
        }
    );

    // Seed Roots
    modelBuilder.Entity<Root>().HasData(
        new Root
        {
            Id = root1Id,
            Name = "Payment Gateway",
            Description = "Integration with payment processors",
            CreatedDate = DateTime.Now.AddDays(-28),
            LastModifiedDate = DateTime.Now.AddDays(-2),
            ProjectId = project1Id,
        },
        new Root
        {
            Id = root2Id,
            Name = "Social Media",
            Description = "Social media API integrations",
            CreatedDate = DateTime.Now.AddDays(-25),
            LastModifiedDate = DateTime.Now.AddDays(-10),
            ProjectId = project1Id,
        },
        new Root
        {
            Id = root3Id,
            Name = "Order Processing",
            Description = "Handles customer orders and fulfillment",
            CreatedDate = DateTime.Now.AddDays(-55),
            LastModifiedDate = DateTime.Now.AddDays(-3),
            ProjectId = project2Id,
        }
    );

    // Seed Messages
    modelBuilder.Entity<Message>().HasData(
        new Message
        {
            Id = message1Id,
            Name = "Process Payment",
            Description = "Request to process a payment transaction",
            CreatedDate = DateTime.Now.AddDays(-28),
            LastModifiedDate = DateTime.Now.AddDays(-2),
            RootId = root1Id,
        },
        new Message
        {
            Id = message2Id,
            Name = "Payment Response",
            Description = "Response from payment processor",
            CreatedDate = DateTime.Now.AddDays(-28),
            LastModifiedDate = DateTime.Now.AddDays(-2),
            RootId = root1Id,
        },
        new Message
        {
            Id = message3Id,
            Name = "Share Post",
            Description = "Shares content to social media platforms",
            CreatedDate = DateTime.Now.AddDays(-20),
            LastModifiedDate = DateTime.Now.AddDays(-5),
            RootId = root2Id,
        },
        new Message
        {
            Id = message4Id,
            Name = "Create Order",
            Description = "Creates a new customer order",
            CreatedDate = DateTime.Now.AddDays(-50),
            LastModifiedDate = DateTime.Now.AddDays(-3),
            RootId = root3Id,
        }
    );

    // Seed Fields
    modelBuilder.Entity<Field>().HasData(
        // Payment message fields
        new Field
        {
            Id = field1Id,
            Name = "Amount",
            Description = "Payment amount in the smallest currency unit",
            Type = FieldType.Decimal,
            DefaultValue = "0",
            IsRequired = true,
            CreatedDate = DateTime.Now.AddDays(-28),
            LastModifiedDate = DateTime.Now.AddDays(-2),
            MessageId = message1Id,
            ParentFieldId = null
        },
        new Field
        {
            Id = field2Id,
            Name = "Currency",
            Description = "Three-letter currency code (ISO 4217)",
            Type = FieldType.String,
            DefaultValue = "USD",
            IsRequired = true,
            CreatedDate = DateTime.Now.AddDays(-28),
            LastModifiedDate = DateTime.Now.AddDays(-2),
            MessageId = message1Id,
            ParentFieldId = null
        },
        new Field
        {
            Id = field3Id,
            Name = "PaymentMethod",
            Description = "Method of payment",
            Type = FieldType.Enum,
            DefaultValue = "CreditCard",
            IsRequired = true,
            CreatedDate = DateTime.Now.AddDays(-28),
            LastModifiedDate = DateTime.Now.AddDays(-2),
            MessageId = message1Id,
            ParentFieldId = null
        },
        // Payment response fields
        new Field
        {
            Id = field4Id,
            Name = "Status",
            Description = "Payment status code",
            Type = FieldType.Enum,
            DefaultValue = "",
            IsRequired = true,
            CreatedDate = DateTime.Now.AddDays(-28),
            LastModifiedDate = DateTime.Now.AddDays(-2),
            MessageId = message2Id,
            ParentFieldId = null
        },
        // Social media fields
        new Field
        {
            Id = field5Id,
            Name = "Content",
            Description = "Content to be shared",
            Type = FieldType.String,
            DefaultValue = "",
            IsRequired = true,
            CreatedDate = DateTime.Now.AddDays(-20),
            LastModifiedDate = DateTime.Now.AddDays(-5),
            MessageId = message3Id,
            ParentFieldId = null
        },
        new Field
        {
            Id = field6Id,
            Name = "Platforms",
            Description = "Social media platforms to share to",
            Type = FieldType.Complex,
            DefaultValue = "",
            IsRequired = true,
            CreatedDate = DateTime.Now.AddDays(-20),
            LastModifiedDate = DateTime.Now.AddDays(-5),
            MessageId = message3Id,
            ParentFieldId = null
        },
        // Child field for platforms
        new Field
        {
            Id = field7Id,
            Name = "Platform",
            Description = "Individual platform",
            Type = FieldType.Enum,
            DefaultValue = "",
            IsRequired = true,
            CreatedDate = DateTime.Now.AddDays(-20),
            LastModifiedDate = DateTime.Now.AddDays(-5),
            MessageId = null,
            ParentFieldId = field6Id
        },
        // Order fields
        new Field
        {
            Id = field8Id,
            Name = "CustomerID",
            Description = "Unique customer identifier",
            Type = FieldType.String,
            DefaultValue = "",
            IsRequired = true,
            CreatedDate = DateTime.Now.AddDays(-50),
            LastModifiedDate = DateTime.Now.AddDays(-3),
            MessageId = message4Id,
            ParentFieldId = null
        }
    );

    // Seed EnumValues
    modelBuilder.Entity<EnumValue>().HasData(
        // Payment method enum values
        new EnumValue
        {
            Id = enumValue1Id,
            Name = "Credit Card",
            Value = "CreditCard",
            Description = "Payment using credit card",
            FieldId = field3Id
        },
        new EnumValue
        {
            Id = enumValue2Id,
            Name = "Bank Transfer",
            Value = "BankTransfer",
            Description = "Direct bank transfer payment",
            FieldId = field3Id
        },
        // Payment status enum values
        new EnumValue
        {
            Id = enumValue3Id,
            Name = "Success",
            Value = "Success",
            Description = "Payment was successful",
            FieldId = field4Id
        },
        new EnumValue
        {
            Id = enumValue4Id,
            Name = "Failed",
            Value = "Failed",
            Description = "Payment processing failed",
            FieldId = field4Id
        },
        // Social platform enum values
        new EnumValue
        {
            Id = enumValue5Id,
            Name = "Twitter",
            Value = "Twitter",
            Description = "Share to Twitter",
            FieldId = field7Id
        }
    );
}
    }
}
