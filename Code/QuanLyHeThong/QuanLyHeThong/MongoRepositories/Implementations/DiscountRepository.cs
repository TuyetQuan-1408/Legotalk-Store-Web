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
    public class DiscountRepository : IDiscountRepository
    {
        private readonly IMongoCollection<Discount> _discountCollection;
        private readonly IMongoCollection<Product> _productCollection;
        public DiscountRepository(MongoDbContext context)
        {
            _discountCollection = context.GetCollection<Discount>("legoTalk", "Discounts");
            _productCollection = context.GetCollection<Product>("legoTalk", "Products");
        }
        public async Task AddDiscount(Discount discount)
        {
            await _discountCollection.InsertOneAsync(discount);
        }

        public async Task DeleteDiscount(string id)
        {
            var objectId = new ObjectId(id);

            var filterForProducts = Builders<Product>.Filter.Eq(p => p.DiscountId, id);
            var updateForProducts = Builders<Product>.Update.Set(p => p.DiscountId, (string)null);
            await _productCollection.UpdateManyAsync(filterForProducts, updateForProducts);
            await _discountCollection.DeleteOneAsync(d => d.DiscountId == objectId);
        }

        public async Task<List<Discount>> GetAllDiscounts()
        {
            return await _discountCollection.Find(discount => true).ToListAsync();
        }

        public async Task<Discount> GetDiscountById(string id)
        {
            var objectId = new ObjectId(id);
            return await _discountCollection.Find(d => d.DiscountId == objectId).FirstOrDefaultAsync();
        }

        public async Task UpdateDiscount(Discount discount)
        {
            var filter = Builders<Discount>.Filter.Eq(d => d.DiscountId, discount.DiscountId);
            var update = Builders<Discount>.Update
                        .Set(d => d.DiscountPercentage, discount.DiscountPercentage)
                        .Set(d => d.DiscountDescription, discount.DiscountDescription);

            await _discountCollection.UpdateOneAsync(filter, update);
        }

    }
}