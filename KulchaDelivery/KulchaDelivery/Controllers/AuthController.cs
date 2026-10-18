using KulchaDelivery.Api.Data;
using KulchaDelivery.Api.Models;
using KulchaDelivery.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KulchaDelivery.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ITokenService _tokens;
    public AuthController(AppDbContext db, ITokenService tokens) { _db = db; _tokens = tokens; }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        if (await _db.Users.AnyAsync(u => u.Email == email || u.Phone == dto.Phone))
            return Conflict(new { message = "Email or phone already registered" });

        var user = new User
        {
            FullName = dto.FullName.Trim(),
            Email = email,
            Phone = dto.Phone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = UserRole.Customer
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var (token, exp) = _tokens.Create(user);
        return Ok(new AuthResponse(token, exp, user.Id, user.FullName, user.Role.ToString()));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password" });

        var (token, exp) = _tokens.Create(user);
        return Ok(new AuthResponse(token, exp, user.Id, user.FullName, user.Role.ToString()));
    }
}
