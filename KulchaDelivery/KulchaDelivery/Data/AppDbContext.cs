using KulchaDelivery.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace KulchaDelivery.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>(e =>
        {
            e.HasIndex(x => x.Email).IsUnique();
            e.HasIndex(x => x.Phone).IsUnique();
            e.Property(x => x.Role).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.FullName).HasMaxLength(100);
            e.Property(x => x.Email).HasMaxLength(150);
            e.Property(x => x.Phone).HasMaxLength(15);
        });

        b.Entity<Address>(e =>
        {
            e.HasOne(x => x.User).WithMany(u => u.Addresses).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            e.Property(x => x.Pincode).HasMaxLength(6);
        });

        b.Entity<MenuItem>(e =>
        {
            e.Property(x => x.Price).HasPrecision(10, 2);
            e.Property(x => x.Category).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.Name).HasMaxLength(120);
        });

        b.Entity<Order>(e =>
        {
            e.Property(x => x.Subtotal).HasPrecision(10, 2);
            e.Property(x => x.DeliveryFee).HasPrecision(10, 2);
            e.Property(x => x.Total).HasPrecision(10, 2);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.PaymentMethod).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.PaymentStatus).HasConversion<string>().HasMaxLength(20);
            e.HasOne(x => x.User).WithMany(u => u.Orders).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Address).WithMany().HasForeignKey(x => x.AddressId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.UserId, x.CreatedAt });
        });

        b.Entity<OrderItem>(e =>
        {
            e.Property(x => x.UnitPrice).HasPrecision(10, 2);
            e.HasOne(x => x.Order).WithMany(o => o.Items).HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.MenuItem).WithMany().HasForeignKey(x => x.MenuItemId).OnDelete(DeleteBehavior.Restrict);
        });

        // Seed menu
        b.Entity<MenuItem>().HasData(
            new MenuItem { Id = 1,  Name = "Amritsari Aloo Kulcha",   Description = "Tandoor-baked kulcha stuffed with spiced potato, served with chole, chutney & butter", Price = 90,  Category = MenuCategory.Kulcha },
            new MenuItem { Id = 2,  Name = "Paneer Kulcha",           Description = "Stuffed with spiced cottage cheese and herbs", Price = 120, Category = MenuCategory.Kulcha },
            new MenuItem { Id = 3,  Name = "Gobi Kulcha",             Description = "Stuffed with spiced grated cauliflower", Price = 100, Category = MenuCategory.Kulcha },
            new MenuItem { Id = 4,  Name = "Onion Kulcha",            Description = "Classic onion & coriander stuffed kulcha", Price = 90,  Category = MenuCategory.Kulcha },
            new MenuItem { Id = 5,  Name = "Mix Veg Kulcha",          Description = "Potato, paneer & onion mix stuffing", Price = 130, Category = MenuCategory.Kulcha },
            new MenuItem { Id = 6,  Name = "Plain Butter Kulcha",     Description = "Soft leavened kulcha brushed with white butter", Price = 50,  Category = MenuCategory.Kulcha },
            new MenuItem { Id = 7,  Name = "Kulcha Chole Combo (2 pc)", Description = "Two aloo kulchas with chole, pickled onion, imli chutney & lassi", Price = 220, Category = MenuCategory.Combo },
            new MenuItem { Id = 8,  Name = "Extra Chole (200g)",      Description = "Punjabi-style spiced chickpeas", Price = 40,  Category = MenuCategory.Side },
            new MenuItem { Id = 9,  Name = "Extra Amul Butter",       Description = "Generous dollop of white butter", Price = 20,  Category = MenuCategory.Side },
            new MenuItem { Id = 10, Name = "Pickled Onion & Chutney", Description = "Sirke wale pyaaz with mint & imli chutney", Price = 15,  Category = MenuCategory.Side },
            new MenuItem { Id = 11, Name = "Sweet Lassi (Glass)",     Description = "Thick Punjabi lassi topped with malai", Price = 60,  Category = MenuCategory.Beverage },
            new MenuItem { Id = 12, Name = "Salted Lassi (Glass)",    Description = "Chilled salted lassi", Price = 50,  Category = MenuCategory.Beverage },
            new MenuItem { Id = 13, Name = "Masala Chaas",            Description = "Spiced buttermilk", Price = 35,  Category = MenuCategory.Beverage },
            new MenuItem { Id = 14, Name = "Phirni (Bowl)",           Description = "Creamy rice pudding set in earthen bowl", Price = 70,  Category = MenuCategory.Dessert }
        );
    }
}
