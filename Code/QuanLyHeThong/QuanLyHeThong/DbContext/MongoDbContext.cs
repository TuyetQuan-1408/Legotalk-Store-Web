using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Xml.Linq;

namespace QuanLyHeThong.DbContext
{
    public class MongoDbContext
    {
        private readonly IMongoClient _mongoClient;

        public MongoDbContext()
        {
            string mongoConnectionString = ReadMongoConnectionStringFromConfig();
            _mongoClient = new MongoClient(mongoConnectionString);
        }

        private string ReadMongoConnectionStringFromConfig()
        {
            string mongoConnectionString = ConfigurationManager.ConnectionStrings["MongoDb"].ConnectionString;
            return mongoConnectionString;
        }

        public async Task<IMongoDatabase> GetDatabaseName(string dbName)
        {
            return _mongoClient.GetDatabase(dbName);
        }

        public IMongoCollection<T> GetCollection<T>(string dbName, string collectionName)
        {
            var database = GetDatabaseName(dbName).Result;
            return database.GetCollection<T>(collectionName);
        }
    }
}