using QuanLyHeThong.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuanLyHeThong.MongoRepositories.Interfaces
{
    public interface IDiscountRepository
    {
        Task AddDiscount(Discount discount);
        Task<List<Discount>> GetAllDiscounts();
        Task UpdateDiscount(Discount discount);
        Task DeleteDiscount(string id);
        Task<Discount> GetDiscountById(string id);
    }
}
