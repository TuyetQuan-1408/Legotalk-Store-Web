using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QuanLyHeThong.Models
{
    public class Status
    {
        [BsonId]
        public ObjectId StatusId { get; set; }
        public string StatusDescription { get; set; }
    }
}