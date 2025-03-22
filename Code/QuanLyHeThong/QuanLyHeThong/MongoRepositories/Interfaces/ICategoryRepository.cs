using QuanLyHeThong.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuanLyHeThong.MongoRepositories.Interfaces
{
    public interface ICategoryRepository
    {
        Task<List<Category>> GetAllCategories(int page, int pageSize);
        Task<Category> GetCategoryById(string id);
        Task AddCategory(Category category);
        Task UpdateCategory(Category category);
        Task DeleteCategory(string id);
        Task<long> GetAllCategoriesCount();
    }
}
