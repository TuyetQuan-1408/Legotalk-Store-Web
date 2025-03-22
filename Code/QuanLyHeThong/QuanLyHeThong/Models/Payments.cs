using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QuanLyHeThong.Models
{
    public class Payments
    {
        [BsonId]
        public ObjectId PaymentId { get; set; }
        public ObjectId OrderId { get; set; }
        public ObjectId StatusId { get; set; }
        public ObjectId PaymentMethodId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentStatus { get; set; }
        public DateTime PaymentDate { get; set; }
    }
}