using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QuanLyHeThong.Models
{
    public class Discount
    {
        [BsonId]
        public ObjectId DiscountId { get; set; }
        [BsonElement("Percentage")]
        public decimal DiscountPercentage { get; set; }
        [BsonElement("Discount_Code")]
        public string DiscountDescription { get; set; }
    }
    public class updateDiscount
    {
        public string DiscountId { get; set; }
        public decimal DiscountPercentage { get; set; }
        public string DiscountDescription { get; set; }
    }
    public class DiscountViewModel
    {
        public string DisplayText { get; set; }
        public string DiscountId { get; set; }
        public string DiscountPercentage { get; set; }
        public string DiscountDescription { get; set; }
    }
}