using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QuanLyHeThong.Models
{
    public class ShoppingCart
    {
        [BsonId]
        public ObjectId CartId { get; set; }
        public ObjectId CustomerId { get; set; }
        public List<CartItem> Items { get; set; }
    }
}