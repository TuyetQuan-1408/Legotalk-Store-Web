using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QuanLyHeThong.Models
{
    public class OrderProduct
    {
        public ObjectId ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal OrderItemPrice { get; set; }
    }
}