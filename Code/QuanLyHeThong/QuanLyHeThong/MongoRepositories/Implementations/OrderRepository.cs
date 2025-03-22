using MongoDB.Bson;
using MongoDB.Driver;
using QuanLyHeThong.DbContext;
using QuanLyHeThong.Helper;
using QuanLyHeThong.Models;
using QuanLyHeThong.MongoRepositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace QuanLyHeThong.MongoRepositories.Implementations
{
    public class OrderRepository : IOrderRepository
    {
        private readonly IMongoCollection<Order> _orderCollection;

        public OrderRepository(MongoDbContext context)
        {
            _orderCollection = context.GetCollection<Order>("legoTalk", "Orders");
        }
        public async Task<List<RevenuePerMonth>> GetMonthlyRevenueAsync(string year)
        {
            if (string.IsNullOrEmpty(year))
            {
                throw new ArgumentException("Year cannot be null or empty", nameof(year));
            }

            int yearInt = int.Parse(year);

            var startDate = new DateTime(yearInt, 1, 1);
            var endDate = startDate.AddYears(1).AddDays(-1);

            string startDateStr = startDate.ToString("dd/MM/yyyy");
            string endDateStr = endDate.ToString("dd/MM/yyyy");

            var filter = Builders<Order>.Filter.And(
                Builders<Order>.Filter.Eq(order => order.Status, "Đã xác nhận"),
                Builders<Order>.Filter.Gte(order => order.OrderDate, startDateStr),
                Builders<Order>.Filter.Lte(order => order.OrderDate, endDateStr)
            );
            var aggregation = await _orderCollection.Aggregate()
                .Match(filter)
                .Project(order => new
                {
                    OrderDate = order.OrderDate,
                    Amount = order.Amount
                })
                .AppendStage<BsonDocument>(new BsonDocument
                {
            { "$addFields", new BsonDocument
                {
                    { "ParsedDate", new BsonDocument("$dateFromString", new BsonDocument
                        {
                            { "dateString", "$OrderDate" },
                            { "format", "%d/%m/%Y" }
                        })
                    }
                }
            }
                })
                .Match(new BsonDocument
                {
            { "ParsedDate", new BsonDocument
                {
                    { "$gte", startDate },
                    { "$lte", endDate }
                }
            }
                })
                .AppendStage<BsonDocument>(new BsonDocument
                {
            { "$addFields", new BsonDocument
                {
                    { "YearMonth", new BsonDocument("$dateToString", new BsonDocument
                        {
                            { "format", "%Y-%m" },
                            { "date", "$ParsedDate" }
                        })
                    }
                }
            }
                })
                .Group(new BsonDocument
                {
            { "_id", "$YearMonth" },
            { "TotalRevenue", new BsonDocument("$sum", "$Amount") }
                })
                .Sort(new BsonDocument("_id", 1))
                .ToListAsync();
            var resultList = aggregation.Select(item =>
            {
                return new RevenuePerMonth
                {
                    YearMonth = item["_id"].AsString,
                    TotalRevenue = item["TotalRevenue"].ToInt32()
                };
            }).ToList();

            return resultList;
        }
    }
}