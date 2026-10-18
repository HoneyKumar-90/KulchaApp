using System.Security.Claims;
using KulchaDelivery.Api.Data;
using KulchaDelivery.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KulchaDelivery.Api.Controllers;

[ApiController, Authorize]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _cfg;
    public OrdersController(AppDbContext db, IConfiguration cfg) { _db = db; _cfg = cfg; }

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<ActionResult<OrderResponse>> Place(PlaceOrderDto dto)
    {
        var address = await _db.Addresses.FirstOrDefaultAsync(a => a.Id == dto.AddressId && a.UserId == UserId);
        if (address is null) return BadRequest(new { message = "Invalid delivery address" });

        var lines = dto.Items.GroupBy(i => i.MenuItemId)
                             .Select(g => new { Id = g.Key, Qty = g.Sum(x => x.Quantity) }).ToList();
        var ids = lines.Select(l => l.Id).ToList();
        var menu = await _db.MenuItems.Where(m => ids.Contains(m.Id) && m.IsAvailable).ToDictionaryAsync(m => m.Id);

        if (menu.Count != ids.Count)
            return BadRequest(new { message = "One or more items are unavailable or do not exist" });

        var order = new Order
        {
            UserId = UserId,
            AddressId = address.Id,
            PaymentMethod = dto.PaymentMethod,
            Notes = dto.Notes,
            Items = lines.Select(l => new OrderItem
            {
                MenuItemId = l.Id,
                ItemName = menu[l.Id].Name,
                UnitPrice = menu[l.Id].Price,  
                Quantity = l.Qty
            }).ToList()
        };

        order.Subtotal = order.Items.Sum(i => i.UnitPrice * i.Quantity);
        var freeAbove = _cfg.GetValue<decimal>("Delivery:FreeDeliveryAbove");
        var fee = _cfg.GetValue<decimal>("Delivery:DeliveryFee");
        order.DeliveryFee = order.Subtotal >= freeAbove ? 0 : fee;
        order.Total = order.Subtotal + order.DeliveryFee;

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, await Load(order.Id));
    }

    [HttpGet("mine")]
    public async Task<ActionResult<IEnumerable<OrderResponse>>> Mine()
    {
        var orders = await Query().Where(o => o.UserId == UserId).OrderByDescending(o => o.CreatedAt).ToListAsync();
        return Ok(orders.Select(Map));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderResponse>> GetById(int id)
    {
        var o = await Query().FirstOrDefaultAsync(x => x.Id == id);
        if (o is null) return NotFound();
        if (o.UserId != UserId && !User.IsInRole("Admin")) return Forbid();
        return Ok(Map(o));
    }

    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var o = await _db.Orders.FirstOrDefaultAsync(x => x.Id == id && x.UserId == UserId);
        if (o is null) return NotFound();
        if (o.Status != OrderStatus.Placed)
            return BadRequest(new { message = "Order is already being prepared and cannot be cancelled" });
        o.Status = OrderStatus.Cancelled;
        o.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ---------- Admin ----------
    [HttpGet, Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<OrderResponse>>> All([FromQuery] OrderStatus? status)
    {
        var q = Query();
        if (status.HasValue) q = q.Where(o => o.Status == status);
        var list = await q.OrderByDescending(o => o.CreatedAt).Take(200).ToListAsync();
        return Ok(list.Select(Map));
    }

    [HttpPut("{id:int}/status"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateStatusDto dto)
    {
        var o = await _db.Orders.FindAsync(id);
        if (o is null) return NotFound();
        if (o.Status is OrderStatus.Delivered or OrderStatus.Cancelled)
            return BadRequest(new { message = $"Order already {o.Status}" });

        o.Status = dto.Status;
        o.UpdatedAt = DateTime.UtcNow;
        if (dto.Status == OrderStatus.Delivered && o.PaymentMethod == PaymentMethod.CashOnDelivery)
            o.PaymentStatus = PaymentStatus.Paid;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ---------- helpers ----------
    private IQueryable<Order> Query() =>
        _db.Orders.AsNoTracking().Include(o => o.Items).Include(o => o.Address).Include(o => o.User);

    private async Task<OrderResponse> Load(int id) => Map(await Query().FirstAsync(o => o.Id == id));

    private static OrderResponse Map(Order o) => new(
        o.Id, o.Status.ToString(), o.PaymentMethod.ToString(), o.PaymentStatus.ToString(),
        o.Subtotal, o.DeliveryFee, o.Total, o.Notes, o.CreatedAt,
        new AddressDto(o.Address!.Label, o.Address.Line1, o.Address.Line2, o.Address.Landmark, o.Address.City, o.Address.Pincode),
        o.User!.FullName, o.User.Phone,
        o.Items.Select(i => new OrderItemResponse(i.MenuItemId, i.ItemName, i.UnitPrice, i.Quantity, i.UnitPrice * i.Quantity)).ToList());
}
