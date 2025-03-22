using QuanLyHeThong.Helper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace QuanLyHeThong.MongoRepositories.Interfaces
{
    public interface IOrderRepository
    {
        Task<List<RevenuePerMonth>> GetMonthlyRevenueAsync(string year);
    }
}