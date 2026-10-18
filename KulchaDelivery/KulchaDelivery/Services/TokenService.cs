using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using KulchaDelivery.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace KulchaDelivery.Api.Services;

public interface ITokenService
{
    (string Token, DateTime ExpiresAt) Create(User user);
}

public class TokenService : ITokenService
{
    private readonly IConfiguration _cfg;
    public TokenService(IConfiguration cfg) => _cfg = cfg;

    public (string Token, DateTime ExpiresAt) Create(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_cfg["Jwt:Key"]!));
        var expires = DateTime.UtcNow.AddMinutes(double.Parse(_cfg["Jwt:ExpiryMinutes"] ?? "720"));
        var token = new JwtSecurityToken(
            _cfg["Jwt:Issuer"], _cfg["Jwt:Audience"], claims,
            expires: expires,
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));
        return (new JwtSecurityTokenHandler().WriteToken(token), expires);
    }
}
