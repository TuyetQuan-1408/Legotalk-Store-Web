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
        public ObjectId OrderId { get; set; }
        [BsonElement("Customer_ID")]
        public ObjectId CustomerId { get; set; }

        [BsonElement("Order_Date")]
        public DateTime OrderDate { get; set; }
        [BsonElement("Discount_ID")]
        public string DiscountId { get; set; }

        [BsonElement("Products")]
        public List<Product> Products { get; set; }

        [BsonElement("Phone_Number")]
        public string Phonenumbers { get; set; }
    }
}