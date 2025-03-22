using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QuanLyHeThong.Models
{
    public class Promotion
    {
        [BsonId]
        public ObjectId PromotionId { get; set; }
        public List<ObjectId> ProductIds { get; set; }
    }
}