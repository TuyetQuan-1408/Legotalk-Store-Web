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
    public class ProductRepository : IProductRepository
    {
        private readonly IMongoCollection<Product> _productCollection;

        public ProductRepository(MongoDbContext context)
        {
            _productCollection = context.GetCollection<Product>("legoTalk", "Products");
        }

        public async Task<List<Product>> GetAllProducts(int page, int pageSize)
        {
            return await _productCollection.Find(product => true)
                                           .Skip((page - 1) * pageSize) 
                                           .Limit(pageSize)               
                                           .ToListAsync();
        }

        public async Task<Product> GetProductById(string id)
        {
            var objectId = new ObjectId(id);
            return await _productCollection.Find(s => s.ProductId == objectId).FirstOrDefaultAsync();
        }

        public async Task AddProduct(Product product)
        {
            await _productCollection.InsertOneAsync(product);
        }

        public async Task UpdateProduct(Product product)
        {
            var filter = Builders<Product>.Filter.Eq(s => s.ProductId, product.ProductId);
            var update = Builders<Product>.Update
                        .Set(s => s.ProductName, product.ProductName)
                        .Set(s => s.CategoryId, product.CategoryId)
                        .Set(s => s.Price, product.Price)
                        .Set(s => s.StockQuantity, product.StockQuantity)
                        .Set(s => s.Weight, product.Weight)
                        .Set(s => s.ProductDescription, product.ProductDescription)
                        .Set(s => s.DiscountId, product.DiscountId)
                        .Set(s => s.Pieces, product.Pieces)
                        .Set(s => s.SecondPrice, product.SecondPrice);

            if (product.Rating != null)
            {
                update = update.Set(s => s.Rating, product.Rating);
            }

            await _productCollection.UpdateOneAsync(filter, update);
        }

        public async Task DeleteProduct(string id)
        {
            var objectId = new ObjectId(id);
            await _productCollection.DeleteOneAsync(s => s.ProductId == objectId);
        }

        public async Task<long> GetAllProductsCount()
        {
            return await _productCollection.CountDocumentsAsync(product => true);
        }
    }
}