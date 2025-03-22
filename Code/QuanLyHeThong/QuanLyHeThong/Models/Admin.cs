using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QuanLyHeThong.Models
{
    public class Admin
    {
        [BsonId]
        public ObjectId AdminId { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }

    }
}