using QuanLyHeThong.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuanLyHeThong.MongoRepositories.Interfaces
{
    public interface IAuthService
    {
        Task<string> GenerateJwtToken(Admin admin);
        Task<Admin> ValidateUser(string username, string password);
        Task<string> RegisterAdmin(string username, string password);
    }
}
