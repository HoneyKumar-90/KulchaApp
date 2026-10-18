using KulchaDelivery.Api.Data;
using KulchaDelivery.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KulchaDelivery.Api.Controllers;

[ApiController]
[Route("api/menu")]
public class MenuController : ControllerBase
{
    private readonly AppDbContext _db;
    public MenuController(AppDbContext db) => _db = db;
        
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MenuItem>>> GetAll([FromQuery] MenuCategory? category, [FromQuery] bool includeUnavailable = false)
    {
        var q = _db.MenuItems.AsNoTracking().AsQueryable();
        if (category.HasValue) q = q.Where(m => m.Category == category);
        if (!includeUnavailable) q = q.Where(m => m.IsAvailable);
        return Ok(await q.OrderBy(m => m.Category).ThenBy(m => m.Name).ToListAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MenuItem>> Get(int id)
    {
        var item = await _db.MenuItems.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost, Authorize(Roles = "Admin")]
    public async Task<ActionResult<MenuItem>> Create(MenuItemDto dto)
    {
        var item = new MenuItem
        {
            Name = dto.Name, Description = dto.Description, Price = dto.Price,
            Category = dto.Category, IsVeg = dto.IsVeg, IsAvailable = dto.IsAvailable, ImageUrl = dto.ImageUrl
        };
        _db.MenuItems.Add(item);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
    }

    [HttpPut("{id:int}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, MenuItemDto dto)
    {
        var item = await _db.MenuItems.FindAsync(id);
        if (item is null) return NotFound();
        item.Name = dto.Name; item.Description = dto.Description; item.Price = dto.Price;
        item.Category = dto.Category; item.IsVeg = dto.IsVeg; item.IsAvailable = dto.IsAvailable; item.ImageUrl = dto.ImageUrl;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _db.MenuItems.FindAsync(id);
        if (item is null) return NotFound();
        item.IsAvailable = false;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
