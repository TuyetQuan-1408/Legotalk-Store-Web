using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QuanLyHeThong.Models
{
    public class OrderReview
    {
        [BsonId]
        public ObjectId ReviewId { get; set; }
        public ObjectId OrderId { get; set; }
        public ObjectId CustomerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public int Rating { get; set; }
        public string ReviewText { get; set; }
    }
}