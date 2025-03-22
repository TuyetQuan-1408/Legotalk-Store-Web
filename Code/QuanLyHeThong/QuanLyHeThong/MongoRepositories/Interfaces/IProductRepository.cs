using QuanLyHeThong.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace QuanLyHeThong.MongoRepositories.Interfaces
{
    public interface IProductRepository
    {
        Task<List<Product>> GetAllProducts(int page, int pageSize);
        Task<Product> GetProductById(string id);
        Task AddProduct(Product product);
        Task UpdateProduct(Product product);
        Task DeleteProduct(string id);
        Task<long> GetAllProductsCount();
    }
}