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
    public class ImageRepository : IImageRepository
    {
        private readonly IMongoCollection<Image> _imageCollection;
        public ImageRepository(MongoDbContext context)
        {
            _imageCollection = context.GetCollection<Image>("legoTalk", "Images");
        }

        public async Task<List<Image>> GetImagesByOrder(string order)
        {
            var filter = Builders<Image>.Filter.Eq(i => i.Order, order);
            return await _imageCollection.Find(filter).ToListAsync();
        }

        public async Task AddImage(Image image)
        {
            await _imageCollection.InsertOneAsync(image);
        }

        public async Task DeleteImage(string imageId)
        {
            var objectId = new ObjectId(imageId);
            await _imageCollection.DeleteOneAsync(i => i.ImageId == objectId);
        }

        public async Task<List<Image>> GetImagesByProductId(string productId)
        {
            return await _imageCollection.Find(s => s.ProductId == productId).ToListAsync();
        }

        public async Task UpdateOrder(string imageId, string newOrder)
        {
            var objectId = new ObjectId(imageId);
            var filter = Builders<Image>.Filter.Eq(i => i.ImageId, objectId);
            var update = Builders<Image>.Update.Set(i => i.Order, newOrder);
            await _imageCollection.UpdateOneAsync(filter, update);
        }

    }
}