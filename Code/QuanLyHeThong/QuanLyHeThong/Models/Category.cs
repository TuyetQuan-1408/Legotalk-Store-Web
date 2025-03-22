using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QuanLyHeThong.Models
{
    public class Category
    {
        [BsonId]
        public ObjectId CategoryId { get; set; }
        [BsonElement("Category_Name")]
        public string CategoryName { get; set; }
    }

    public class updateCategory
    {
        public string CategoryId { get; set; }
        public string CategoryName { get; set; }
    }
}