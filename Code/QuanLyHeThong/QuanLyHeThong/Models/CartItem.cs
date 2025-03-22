using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QuanLyHeThong.Models
{
    public class CartItem
    {
        public ObjectId ProductId { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }
}