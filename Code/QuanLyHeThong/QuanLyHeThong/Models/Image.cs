using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QuanLyHeThong.Models
{
    public class Image
    {
        [BsonId]
        public ObjectId ImageId { get; set; }

        [BsonElement("Tag")]
        public string Tag { get; set; }

        [BsonElement("ID")]
        public string ProductId { get; set; }

        [BsonElement("Order")]
        public string Order { get; set; }

        [BsonElement("ImageData")]
        public string ImageData { get; set; }

        [BsonElement("MIMEType")]
        public string MIMEType { get; set; }
    }

    public class detailImage
    {
        public string ImageId { get; set; }
        public string Order { get; set; }
        public string ImageData { get; set; }
    }

    public class UpdateOrderModel
    {
        public string ImageId { get; set; }
        public string Order { get; set; }
    }

}