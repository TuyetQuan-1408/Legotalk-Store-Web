using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QuanLyHeThong.Models
{
    public class PaymentMethod
    {
        [BsonId]
        public ObjectId PaymentMethodId { get; set; }
        public string PaymentName { get; set; }
        public string PaymentProvider { get; set; }
    }
}