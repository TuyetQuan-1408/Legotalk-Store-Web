using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QuanLyHeThong.Models
{
    public class Delivery
    {
        [BsonId]
        public ObjectId DeliveryId { get; set; }
        public ObjectId OrderId { get; set; }
        public ObjectId StatusId { get; set; }
        public string Address { get; set; }
    }
}