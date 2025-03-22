using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using QuanLyHeThong.DbContext;
using QuanLyHeThong.Models;
using QuanLyHeThong.MongoRepositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace QuanLyHeThong.MongoRepositories.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IMongoCollection<Admin> _adminCollection;
        private readonly string _secretKey;
        public AuthService(MongoDbContext context)
        {
            _adminCollection = context.GetCollection<Admin>("legoTalk","Admin");
            _secretKey = ConfigurationManager.AppSettings["SecretKey"];
        }
        public async Task<string> GenerateJwtToken(Admin admin)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new System.Security.Claims.ClaimsIdentity(new[]
                {
                    new System.Security.Claims.Claim("id", admin.AdminId.ToString()),
                    new System.Security.Claims.Claim("username", admin.UserName)
                }),
                Expires = System.DateTime.Now.AddHours(1),
                SigningCredentials = credentials
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task<Admin> ValidateUser(string username, string password)
        {
            var hashedPassword = HashPassword(password);
            var admin = await _adminCollection.AsQueryable()
                .FirstOrDefaultAsync(a => a.UserName == username && a.Password == hashedPassword);
            return admin;
        }
        public async Task<string> RegisterAdmin(string username, string password)
        {
            var existingAdmin = await _adminCollection.AsQueryable()
                .FirstOrDefaultAsync(a => a.UserName == username);

            if (existingAdmin != null)
            {
                return "Mật khẩu đã tồn tại";
            }

            var hashedPassword = HashPassword(password);

            var newAdmin = new Admin
            {
                AdminId = ObjectId.GenerateNewId(),
                UserName = username,
                Password = hashedPassword
            };

            await _adminCollection.InsertOneAsync(newAdmin);
            return "Đăng ký thành công";
        }
        private string HashPassword(string password)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(bytes);
            }
        }
    }
}