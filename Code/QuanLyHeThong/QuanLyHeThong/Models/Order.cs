using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QuanLyHeThong.Models
{
    public class Order
    {
        [BsonId]
        public ObjectId Id { get; set; }
        [BsonElement("Order_ID")]
        public string OrderId { get; set; }
        [BsonElement("Customer_ID")]
        public ObjectId CustomerId { get; set; }

        [BsonElement("Order_Date")]
        public string OrderDate { get; set; }
        [BsonElement("Discount_Code")]
        public string DiscountCode { get; set; }
        public int Amount { get; set; }
        [BsonElement("Products")]
        public List<StatisticalProduct> Products { get; set; }
        public string Status { get; set; }
    }
}