using System.Security.Claims;
using KulchaDelivery.Api.Data;
using KulchaDelivery.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KulchaDelivery.Api.Controllers;

[ApiController, Authorize]
[Route("api/addresses")]
public class AddressesController : ControllerBase
{
    private readonly AppDbContext _db;
    public AddressesController(AppDbContext db) => _db = db;
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Address>>> Mine() =>
        Ok(await _db.Addresses.AsNoTracking().Where(a => a.UserId == UserId)
            .Select(a => new { a.Id, a.Label, a.Line1, a.Line2, a.Landmark, a.City, a.Pincode }).ToListAsync());

    [HttpPost]
    public async Task<IActionResult> Add(AddressDto dto)
    {
        var a = new Address
        {
            UserId = UserId, Label = dto.Label, Line1 = dto.Line1, Line2 = dto.Line2,
            Landmark = dto.Landmark, City = dto.City, Pincode = dto.Pincode
        };
        _db.Addresses.Add(a);
        await _db.SaveChangesAsync();
        return Ok(new { a.Id, a.Label, a.Line1, a.Line2, a.Landmark, a.City, a.Pincode });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var a = await _db.Addresses.FirstOrDefaultAsync(x => x.Id == id && x.UserId == UserId);
        if (a is null) return NotFound();
        if (await _db.Orders.AnyAsync(o => o.AddressId == id))
            return Conflict(new { message = "Address is used by an existing order and cannot be deleted" });
        _db.Addresses.Remove(a);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
