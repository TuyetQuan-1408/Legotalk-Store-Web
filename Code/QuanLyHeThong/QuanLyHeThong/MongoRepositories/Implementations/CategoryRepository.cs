using MongoDB.Bson;
using MongoDB.Driver;
using QuanLyHeThong.DbContext;
using QuanLyHeThong.Models;
using QuanLyHeThong.MongoRepositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace QuanLyHeThong.MongoRepositories.Implementations
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly IMongoCollection<Category> _categoryCollection;
        private readonly IMongoCollection<Product> _productCollection;
        public CategoryRepository(MongoDbContext context)
        {
            _categoryCollection = context.GetCollection<Category>("legoTalk", "Categories");
            _productCollection = context.GetCollection<Product>("legoTalk", "Products");
        }

        public async Task<List<Category>> GetAllCategories(int page, int pageSize)
        {
            return await _categoryCollection.Find(category => true)
                                            .Skip((page - 1) * pageSize)
                                            .Limit(pageSize)
                                            .ToListAsync();
        }

        public async Task<Category> GetCategoryById(string id)
        {
            var objectId = new ObjectId(id);
            return await _categoryCollection.Find(c => c.CategoryId == objectId).FirstOrDefaultAsync();
        }

        public async Task AddCategory(Category category)
        {
            await _categoryCollection.InsertOneAsync(category);
        }

        public async Task UpdateCategory(Category category)
        {
            var filter = Builders<Category>.Filter.Eq(c => c.CategoryId, category.CategoryId);
            var update = Builders<Category>.Update
                        .Set(c => c.CategoryName, category.CategoryName);

            await _categoryCollection.UpdateOneAsync(filter, update);
        }

        public async Task DeleteCategory(string id)
        {
            var objectId = new ObjectId(id);
            var filterForProducts = Builders<Product>.Filter.Eq(p => p.CategoryId, id);
            var updateForProducts = Builders<Product>.Update.Set(p => p.CategoryId, (string)null);
            await _productCollection.UpdateManyAsync(filterForProducts, updateForProducts);
            await _categoryCollection.DeleteOneAsync(c => c.CategoryId == objectId);
        }

        public async Task<long> GetAllCategoriesCount()
        {
            return await _categoryCollection.CountDocumentsAsync(category => true);
        }
    }
}