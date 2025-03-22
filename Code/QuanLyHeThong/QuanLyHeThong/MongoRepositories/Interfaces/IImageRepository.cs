using QuanLyHeThong.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace QuanLyHeThong.MongoRepositories.Interfaces
{
    public interface IImageRepository
    {
        Task<List<Image>> GetImagesByOrder(string order);
        Task AddImage(Image image);
        Task DeleteImage(string imageId);
        Task<List<Image>> GetImagesByProductId(string productId);
        Task UpdateOrder(string imageId, string newOrder);
    }
}