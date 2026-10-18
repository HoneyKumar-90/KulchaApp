using System.ComponentModel.DataAnnotations;

namespace KulchaDelivery.Api.Models;

public record RegisterDto(
    [Required, StringLength(100)] string FullName,
    [Required, RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Enter a valid 10-digit Indian mobile number")] string Phone,
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password);

public record LoginDto([Required] string Email, [Required] string Password);

public record AuthResponse(string Token, DateTime ExpiresAt, int UserId, string FullName, string Role);

public record MenuItemDto(
    [Required, StringLength(120)] string Name,
    string? Description,
    [Range(1, 10000)] decimal Price,
    MenuCategory Category,
    bool IsVeg,
    bool IsAvailable,
    string? ImageUrl);

public record AddressDto(
    string Label,
    [Required] string Line1,
    string? Line2,
    string? Landmark,
    [Required] string City,
    [Required, RegularExpression(@"^\d{6}$")] string Pincode);

public record OrderLineDto([Required] int MenuItemId, [Range(1, 50)] int Quantity);

public record PlaceOrderDto(
    [Required] int AddressId,
    PaymentMethod PaymentMethod,
    string? Notes,
    [Required, MinLength(1)] List<OrderLineDto> Items);

public record UpdateStatusDto(OrderStatus Status);

public record OrderItemResponse(int MenuItemId, string ItemName, decimal UnitPrice, int Quantity, decimal LineTotal);

public record OrderResponse(
    int Id, string Status, string PaymentMethod, string PaymentStatus,
    decimal Subtotal, decimal DeliveryFee, decimal Total, string? Notes, DateTime CreatedAt,
    AddressDto DeliveryAddress, string CustomerName, string CustomerPhone,
    List<OrderItemResponse> Items);
