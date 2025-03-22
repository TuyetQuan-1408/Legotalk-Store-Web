using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QuanLyHeThong.Models
{
    public class Product
    {
        [BsonId]
        public ObjectId ProductId { get; set; }
        [BsonElement("Category_ID")]
        public string CategoryId { get; set; }
        [BsonElement("Product_Name")]
        public string ProductName { get; set; }
        public decimal Price { get; set; }
        public double Weight { get; set; }
        [BsonElement("Product_Description")]
        public string ProductDescription { get; set; }
        [BsonElement("Stock_Quantity")]
        public int StockQuantity { get; set; }
        [BsonIgnore]
        public string Avatar { get; set; }

        [BsonElement("Discount_ID")]
        public string DiscountId { get; set; }
        [BsonElement("Second_Price")]
        public decimal SecondPrice { get; set; }
        public double Rating { get; set; }
        public int Pieces { get; set; }
    }
    public class updateProduct
    {
        public string ProductId { get; set; }
        public string CategoryId { get; set; }
        public string ProductName { get; set; }
        public decimal Price { get; set; }
        public double Weight { get; set; }
        public string ProductDescription { get; set; }
        public int StockQuantity { get; set; }
        public string Base64Image { get; set; }
        public string DiscountId { get; set; }
        public decimal SecondPrice { get; set; }
        public double Rating { get; set; }
        public int Pieces { get; set; }
    }
}