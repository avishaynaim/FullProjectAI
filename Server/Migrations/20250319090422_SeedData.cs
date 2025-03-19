using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TreeViewApp.Migrations
{
    /// <inheritdoc />
    public partial class SeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LastModifiedDate = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LastModifiedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ProjectId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Roots_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Messages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LastModifiedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    RootId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Messages_Roots_RootId",
                        column: x => x.RootId,
                        principalTable: "Roots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Fields",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    DefaultValue = table.Column<string>(type: "TEXT", nullable: false),
                    IsRequired = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LastModifiedDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    MessageId = table.Column<Guid>(type: "TEXT", nullable: true),
                    ParentFieldId = table.Column<Guid>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Fields", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Fields_Fields_ParentFieldId",
                        column: x => x.ParentFieldId,
                        principalTable: "Fields",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Fields_Messages_MessageId",
                        column: x => x.MessageId,
                        principalTable: "Messages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EnumValues",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    FieldId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnumValues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EnumValues_Fields_FieldId",
                        column: x => x.FieldId,
                        principalTable: "Fields",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Projects",
                columns: new[] { "Id", "CreatedDate", "Description", "LastModifiedDate", "Name" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000001"), new DateTime(2024, 11, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), "Comprehensive API integration platform with support for multiple third-party services", new DateTime(2025, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), "API Integration Platform" },
                    { new Guid("00000000-0000-0000-0000-000000000002"), new DateTime(2024, 12, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), "Scalable B2B/B2C e-commerce system with inventory management and payment processing", new DateTime(2025, 3, 17, 0, 0, 0, 0, DateTimeKind.Unspecified), "Enterprise E-Commerce System" },
                    { new Guid("00000000-0000-0000-0000-000000000003"), new DateTime(2025, 1, 19, 0, 0, 0, 0, DateTimeKind.Unspecified), "Real-time data collection and analytics platform for IoT devices and sensors", new DateTime(2025, 3, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), "IoT Data Analytics Platform" }
                });

            migrationBuilder.InsertData(
                table: "Roots",
                columns: new[] { "Id", "CreatedDate", "Description", "LastModifiedDate", "Name", "ProjectId" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000101"), new DateTime(2024, 11, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), "Integration with multiple payment processors", new DateTime(2025, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), "Payment Gateway", new Guid("00000000-0000-0000-0000-000000000001") },
                    { new Guid("00000000-0000-0000-0000-000000000102"), new DateTime(2024, 11, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), "Social media API integrations", new DateTime(2025, 3, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "Social Media", new Guid("00000000-0000-0000-0000-000000000001") },
                    { new Guid("00000000-0000-0000-0000-000000000103"), new DateTime(2024, 12, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), "Email delivery and tracking services", new DateTime(2025, 3, 11, 0, 0, 0, 0, DateTimeKind.Unspecified), "Email Services", new Guid("00000000-0000-0000-0000-000000000001") },
                    { new Guid("00000000-0000-0000-0000-000000000104"), new DateTime(2024, 12, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "User behavior and application analytics", new DateTime(2025, 3, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), "Analytics Services", new Guid("00000000-0000-0000-0000-000000000001") },
                    { new Guid("00000000-0000-0000-0000-000000000105"), new DateTime(2024, 12, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "OAuth and other authentication providers", new DateTime(2025, 3, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), "Authentication", new Guid("00000000-0000-0000-0000-000000000001") },
                    { new Guid("00000000-0000-0000-0000-000000000106"), new DateTime(2024, 12, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), "Shipping and logistics providers", new DateTime(2025, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), "Shipping Services", new Guid("00000000-0000-0000-0000-000000000001") },
                    { new Guid("00000000-0000-0000-0000-000000000107"), new DateTime(2024, 12, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), "Geolocation and mapping providers", new DateTime(2025, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mapping Services", new Guid("00000000-0000-0000-0000-000000000001") },
                    { new Guid("00000000-0000-0000-0000-000000000108"), new DateTime(2024, 12, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), "Cloud storage and file management", new DateTime(2025, 3, 16, 0, 0, 0, 0, DateTimeKind.Unspecified), "Cloud Storage", new Guid("00000000-0000-0000-0000-000000000001") },
                    { new Guid("00000000-0000-0000-0000-000000000109"), new DateTime(2025, 1, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), "SMS and push notification providers", new DateTime(2025, 3, 17, 0, 0, 0, 0, DateTimeKind.Unspecified), "Messaging Services", new Guid("00000000-0000-0000-0000-000000000001") },
                    { new Guid("00000000-0000-0000-0000-00000000010a"), new DateTime(2025, 1, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), "Data enrichment and validation services", new DateTime(2025, 3, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), "Data Enrichment", new Guid("00000000-0000-0000-0000-000000000001") },
                    { new Guid("00000000-0000-0000-0000-000000000201"), new DateTime(2024, 12, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), "Product information and categorization", new DateTime(2025, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), "Product Catalog", new Guid("00000000-0000-0000-0000-000000000002") },
                    { new Guid("00000000-0000-0000-0000-000000000202"), new DateTime(2024, 12, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "Customer profiles and segmentation", new DateTime(2025, 3, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "Customer Management", new Guid("00000000-0000-0000-0000-000000000002") },
                    { new Guid("00000000-0000-0000-0000-000000000203"), new DateTime(2024, 12, 27, 0, 0, 0, 0, DateTimeKind.Unspecified), "Order creation and fulfillment", new DateTime(2025, 3, 11, 0, 0, 0, 0, DateTimeKind.Unspecified), "Order Processing", new Guid("00000000-0000-0000-0000-000000000002") },
                    { new Guid("00000000-0000-0000-0000-000000000204"), new DateTime(2024, 12, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), "Stock levels and inventory tracking", new DateTime(2025, 3, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), "Inventory Management", new Guid("00000000-0000-0000-0000-000000000002") },
                    { new Guid("00000000-0000-0000-0000-000000000205"), new DateTime(2024, 12, 29, 0, 0, 0, 0, DateTimeKind.Unspecified), "Payment methods and transactions", new DateTime(2025, 3, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), "Payment Processing", new Guid("00000000-0000-0000-0000-000000000002") },
                    { new Guid("00000000-0000-0000-0000-000000000206"), new DateTime(2024, 12, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), "Shipping options and tracking", new DateTime(2025, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), "Shipping", new Guid("00000000-0000-0000-0000-000000000002") },
                    { new Guid("00000000-0000-0000-0000-000000000207"), new DateTime(2024, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), "Discounts and promotional campaigns", new DateTime(2025, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Promotions", new Guid("00000000-0000-0000-0000-000000000002") },
                    { new Guid("00000000-0000-0000-0000-000000000208"), new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Tax rates and calculations", new DateTime(2025, 3, 16, 0, 0, 0, 0, DateTimeKind.Unspecified), "Tax Calculation", new Guid("00000000-0000-0000-0000-000000000002") },
                    { new Guid("00000000-0000-0000-0000-000000000209"), new DateTime(2025, 1, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), "Return requests and processing", new DateTime(2025, 3, 17, 0, 0, 0, 0, DateTimeKind.Unspecified), "Returns Management", new Guid("00000000-0000-0000-0000-000000000002") },
                    { new Guid("00000000-0000-0000-0000-00000000020a"), new DateTime(2025, 1, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), "Sales and analytics reporting", new DateTime(2025, 3, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), "Reporting", new Guid("00000000-0000-0000-0000-000000000002") },
                    { new Guid("00000000-0000-0000-0000-000000000301"), new DateTime(2025, 1, 24, 0, 0, 0, 0, DateTimeKind.Unspecified), "IoT device onboarding and registration", new DateTime(2025, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), "Device Registration", new Guid("00000000-0000-0000-0000-000000000003") },
                    { new Guid("00000000-0000-0000-0000-000000000302"), new DateTime(2025, 1, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), "Sensor data collection and normalization", new DateTime(2025, 3, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "Data Collection", new Guid("00000000-0000-0000-0000-000000000003") },
                    { new Guid("00000000-0000-0000-0000-000000000303"), new DateTime(2025, 1, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "Stream processing of sensor data", new DateTime(2025, 3, 11, 0, 0, 0, 0, DateTimeKind.Unspecified), "Real-time Processing", new Guid("00000000-0000-0000-0000-000000000003") },
                    { new Guid("00000000-0000-0000-0000-000000000304"), new DateTime(2025, 1, 27, 0, 0, 0, 0, DateTimeKind.Unspecified), "Data warehousing for historical analysis", new DateTime(2025, 3, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), "Long-term Storage", new Guid("00000000-0000-0000-0000-000000000003") },
                    { new Guid("00000000-0000-0000-0000-000000000305"), new DateTime(2025, 1, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), "Anomaly detection and notification", new DateTime(2025, 3, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), "Alerting System", new Guid("00000000-0000-0000-0000-000000000003") },
                    { new Guid("00000000-0000-0000-0000-000000000306"), new DateTime(2025, 1, 29, 0, 0, 0, 0, DateTimeKind.Unspecified), "Data visualization and dashboards", new DateTime(2025, 3, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), "Visualization", new Guid("00000000-0000-0000-0000-000000000003") },
                    { new Guid("00000000-0000-0000-0000-000000000307"), new DateTime(2025, 1, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), "Machine learning for predictive insights", new DateTime(2025, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Predictive Analytics", new Guid("00000000-0000-0000-0000-000000000003") },
                    { new Guid("00000000-0000-0000-0000-000000000308"), new DateTime(2025, 1, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), "Remote configuration and updates", new DateTime(2025, 3, 16, 0, 0, 0, 0, DateTimeKind.Unspecified), "Device Management", new Guid("00000000-0000-0000-0000-000000000003") },
                    { new Guid("00000000-0000-0000-0000-000000000309"), new DateTime(2025, 2, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "User permissions and authentication", new DateTime(2025, 3, 17, 0, 0, 0, 0, DateTimeKind.Unspecified), "User Access", new Guid("00000000-0000-0000-0000-000000000003") },
                    { new Guid("00000000-0000-0000-0000-00000000030a"), new DateTime(2025, 2, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), "External API integration for IoT platform", new DateTime(2025, 3, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), "API Services", new Guid("00000000-0000-0000-0000-000000000003") }
                });

            migrationBuilder.InsertData(
                table: "Messages",
                columns: new[] { "Id", "CreatedDate", "Description", "LastModifiedDate", "Name", "RootId" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000401"), new DateTime(2024, 11, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "Request to process a payment transaction", new DateTime(2025, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), "Process Payment", new Guid("00000000-0000-0000-0000-000000000101") },
                    { new Guid("00000000-0000-0000-0000-000000000402"), new DateTime(2024, 11, 27, 0, 0, 0, 0, DateTimeKind.Unspecified), "Response from payment processor", new DateTime(2025, 3, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "Payment Response", new Guid("00000000-0000-0000-0000-000000000101") },
                    { new Guid("00000000-0000-0000-0000-000000000403"), new DateTime(2024, 11, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), "Request to refund a processed payment", new DateTime(2025, 3, 11, 0, 0, 0, 0, DateTimeKind.Unspecified), "Payment Refund", new Guid("00000000-0000-0000-0000-000000000101") },
                    { new Guid("00000000-0000-0000-0000-000000000404"), new DateTime(2024, 11, 29, 0, 0, 0, 0, DateTimeKind.Unspecified), "Response from payment processor for refund", new DateTime(2025, 3, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), "Refund Response", new Guid("00000000-0000-0000-0000-000000000101") },
                    { new Guid("00000000-0000-0000-0000-000000000405"), new DateTime(2024, 11, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), "Request to check payment status", new DateTime(2025, 3, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), "Payment Status", new Guid("00000000-0000-0000-0000-000000000101") }
                });

            migrationBuilder.InsertData(
                table: "Fields",
                columns: new[] { "Id", "CreatedDate", "DefaultValue", "Description", "IsRequired", "LastModifiedDate", "MessageId", "Name", "ParentFieldId", "Type" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000501"), new DateTime(2024, 11, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "0", "Payment amount in smallest currency unit", true, new DateTime(2025, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("00000000-0000-0000-0000-000000000401"), "Amount", null, 2 },
                    { new Guid("00000000-0000-0000-0000-000000000502"), new DateTime(2024, 11, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "USD", "Three-letter currency code (ISO 4217)", true, new DateTime(2025, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("00000000-0000-0000-0000-000000000401"), "Currency", null, 0 },
                    { new Guid("00000000-0000-0000-0000-000000000503"), new DateTime(2024, 11, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Unique identifier for the transaction", true, new DateTime(2025, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("00000000-0000-0000-0000-000000000401"), "TransactionId", null, 0 },
                    { new Guid("00000000-0000-0000-0000-000000000504"), new DateTime(2024, 11, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Payment description", false, new DateTime(2025, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("00000000-0000-0000-0000-000000000401"), "Description", null, 0 },
                    { new Guid("00000000-0000-0000-0000-000000000505"), new DateTime(2024, 11, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Transaction timestamp", true, new DateTime(2025, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("00000000-0000-0000-0000-000000000401"), "Timestamp", null, 4 },
                    { new Guid("00000000-0000-0000-0000-000000000601"), new DateTime(2024, 11, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Customer information", true, new DateTime(2025, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("00000000-0000-0000-0000-000000000401"), "Customer", null, 6 },
                    { new Guid("00000000-0000-0000-0000-000000000801"), new DateTime(2024, 11, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "CreditCard", "Method of payment", true, new DateTime(2025, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("00000000-0000-0000-0000-000000000401"), "PaymentMethod", null, 5 }
                });

            migrationBuilder.InsertData(
                table: "EnumValues",
                columns: new[] { "Id", "Description", "FieldId", "Name", "Value" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000802"), "Payment using credit card", new Guid("00000000-0000-0000-0000-000000000801"), "Credit Card", "CreditCard" },
                    { new Guid("00000000-0000-0000-0000-000000000803"), "Payment using debit card", new Guid("00000000-0000-0000-0000-000000000801"), "Debit Card", "DebitCard" },
                    { new Guid("00000000-0000-0000-0000-000000000804"), "Direct bank transfer payment", new Guid("00000000-0000-0000-0000-000000000801"), "Bank Transfer", "BankTransfer" },
                    { new Guid("00000000-0000-0000-0000-000000000805"), "Payment using digital wallet (PayPal, Apple Pay, etc.)", new Guid("00000000-0000-0000-0000-000000000801"), "Digital Wallet", "DigitalWallet" },
                    { new Guid("00000000-0000-0000-0000-000000000806"), "Payment using cryptocurrency", new Guid("00000000-0000-0000-0000-000000000801"), "Cryptocurrency", "Cryptocurrency" }
                });

            migrationBuilder.InsertData(
                table: "Fields",
                columns: new[] { "Id", "CreatedDate", "DefaultValue", "Description", "IsRequired", "LastModifiedDate", "MessageId", "Name", "ParentFieldId", "Type" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000602"), new DateTime(2024, 11, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Customer first name", true, new DateTime(2025, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "FirstName", new Guid("00000000-0000-0000-0000-000000000601"), 0 },
                    { new Guid("00000000-0000-0000-0000-000000000603"), new DateTime(2024, 11, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Customer last name", true, new DateTime(2025, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "LastName", new Guid("00000000-0000-0000-0000-000000000601"), 0 },
                    { new Guid("00000000-0000-0000-0000-000000000604"), new DateTime(2024, 11, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Customer email address", true, new DateTime(2025, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Email", new Guid("00000000-0000-0000-0000-000000000601"), 0 },
                    { new Guid("00000000-0000-0000-0000-000000000605"), new DateTime(2024, 11, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Customer phone number", false, new DateTime(2025, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Phone", new Guid("00000000-0000-0000-0000-000000000601"), 0 },
                    { new Guid("00000000-0000-0000-0000-000000000606"), new DateTime(2024, 11, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Customer address information", false, new DateTime(2025, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Address", new Guid("00000000-0000-0000-0000-000000000601"), 6 },
                    { new Guid("00000000-0000-0000-0000-000000000701"), new DateTime(2024, 11, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Customer shipping address", false, new DateTime(2025, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "ShippingAddress", new Guid("00000000-0000-0000-0000-000000000606"), 6 },
                    { new Guid("00000000-0000-0000-0000-000000000702"), new DateTime(2024, 11, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Street address", true, new DateTime(2025, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Street", new Guid("00000000-0000-0000-0000-000000000701"), 0 },
                    { new Guid("00000000-0000-0000-0000-000000000703"), new DateTime(2024, 11, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "City", true, new DateTime(2025, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "City", new Guid("00000000-0000-0000-0000-000000000701"), 0 },
                    { new Guid("00000000-0000-0000-0000-000000000704"), new DateTime(2024, 11, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Postal code / ZIP", true, new DateTime(2025, 3, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "PostalCode", new Guid("00000000-0000-0000-0000-000000000701"), 0 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_EnumValues_FieldId",
                table: "EnumValues",
                column: "FieldId");

            migrationBuilder.CreateIndex(
                name: "IX_Fields_MessageId",
                table: "Fields",
                column: "MessageId");

            migrationBuilder.CreateIndex(
                name: "IX_Fields_ParentFieldId",
                table: "Fields",
                column: "ParentFieldId");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_RootId",
                table: "Messages",
                column: "RootId");

            migrationBuilder.CreateIndex(
                name: "IX_Roots_ProjectId",
                table: "Roots",
                column: "ProjectId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EnumValues");

            migrationBuilder.DropTable(
                name: "Fields");

            migrationBuilder.DropTable(
                name: "Messages");

            migrationBuilder.DropTable(
                name: "Roots");

            migrationBuilder.DropTable(
                name: "Projects");
        }
    }
}
