namespace KulchaDelivery.Api.Models;

public enum UserRole { Customer, Admin }
public enum MenuCategory { Kulcha, Combo, Side, Beverage, Dessert }
public enum OrderStatus { Placed, Preparing, OutForDelivery, Delivered, Cancelled }
public enum PaymentMethod { CashOnDelivery, Upi, Card }
public enum PaymentStatus { Pending, Paid, Failed, Refunded }

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public UserRole Role { get; set; } = UserRole.Customer;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<Address> Addresses { get; set; } = new();
    public List<Order> Orders { get; set; } = new();
}

public class Address
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Label { get; set; } = "Home";
    public string Line1 { get; set; } = "";
    public string? Line2 { get; set; }
    public string? Landmark { get; set; }
    public string City { get; set; } = "";
    public string Pincode { get; set; } = "";
    public User? User { get; set; }
}

public class MenuItem
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public MenuCategory Category { get; set; }
    public bool IsVeg { get; set; } = true;
    public bool IsAvailable { get; set; } = true;
    public string? ImageUrl { get; set; }
}

public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int AddressId { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Placed;
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public decimal Subtotal { get; set; }
    public decimal DeliveryFee { get; set; }
    public decimal Total { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public User? User { get; set; }
    public Address? Address { get; set; }
    public List<OrderItem> Items { get; set; } = new();
}

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int MenuItemId { get; set; }
    public string ItemName { get; set; } = "";   // snapshot at order time
    public decimal UnitPrice { get; set; }       // snapshot at order time
    public int Quantity { get; set; }
    public Order? Order { get; set; }
    public MenuItem? MenuItem { get; set; }
}
