using AutoMapper;
using DnsClient.Internal;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using Newtonsoft.Json;
using QuanLyHeThong.Helper;
using QuanLyHeThong.Models;
using QuanLyHeThong.MongoRepositories.Implementations;
using QuanLyHeThong.MongoRepositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace QuanLyHeThong.Controllers
{
    public class HomeController : Controller
    {
        private readonly IProductRepository _productRepository;
        private readonly IAuthService _adminRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IDiscountRepository _discountRepository;
        private readonly IImageRepository _imageRepository;
        private readonly IOrderRepository _orderRepository;
        public HomeController(IProductRepository productRepository, IAuthService adminRepository,
            ICategoryRepository categoryRepository, IDiscountRepository discountRepository, 
            IImageRepository imageRepository, IOrderRepository orderRepository)
        {
            _productRepository = productRepository;
            _adminRepository = adminRepository;
            _categoryRepository = categoryRepository;
            _discountRepository = discountRepository;
            _imageRepository = imageRepository;
            _orderRepository = orderRepository;
        }
        public async Task<JsonResult> Test(string year)
        {
            var monthlyRevenue = await _orderRepository.GetMonthlyRevenueAsync(year);
            return Json(monthlyRevenue, JsonRequestBehavior.AllowGet);
        }
        [AuthorizeAdminFilter]
        public async Task<ActionResult> Index(string year = "2025")
        {
            var monthlyRevenue = await _orderRepository.GetMonthlyRevenueAsync(year);
            ViewBag.MonthlyRevenue = monthlyRevenue;
            ViewBag.CurrentYear = Convert.ToInt32(year);
            return View();
        }

        public async Task<string> SignUp(string username = "KKK", string password = "123")
        {
            var newAdmin = await _adminRepository.RegisterAdmin(username, password);
            return newAdmin;
        }
        public ActionResult Login()
        {
            if (Session["AdminUser"] != null)
            {
                return RedirectToAction("Index");
            }
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Login(string username, string password)
        {
            var admin = await _adminRepository.ValidateUser(username, password);
            if (admin != null)
            {
                Session["AdminUser"] = admin;
                return RedirectToAction("Index");
            }
            ViewBag.ErrorMessage = "Tên đăng nhập hoặc mật khẩu không chính xác.";
            return View();
        }

        [AuthorizeAdminFilter]
        public async Task<ActionResult> Danhsachsanpham(int page = 1, int pageSize = 8)
        {
            var products = await _productRepository.GetAllProducts(page, pageSize);
            var totalProducts = await _productRepository.GetAllProductsCount();
            var totalPages = (int)Math.Ceiling((double)totalProducts / pageSize);
            ViewBag.TotalPages = totalPages;
            ViewBag.CurrentPage = page;
            var categories = await _categoryRepository.GetAllCategories(1, 100);
            var discounts = await _discountRepository.GetAllDiscounts();
            var categoriesWithStringId = categories.Select(c => new
            {
                CategoryId = c.CategoryId.ToString(),
                c.CategoryName
            }).ToList();
            var discountsWithStringId = discounts.Select(d => new DiscountViewModel
            {
                DiscountId = d.DiscountId.ToString(),
                DiscountPercentage = d.DiscountPercentage.ToString(),
                DiscountDescription = d.DiscountDescription.ToString(),
                DisplayText = $"{d.DiscountPercentage}% - {d.DiscountDescription}"
            }).ToList();
            ViewBag.Categories = new SelectList(categoriesWithStringId, "CategoryId", "CategoryName");
            ViewBag.Discounts = new SelectList(discountsWithStringId, "DiscountId", "DisplayText");
            ViewBag.SettingDiscountView = discountsWithStringId;
            return View(products);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> DeleteProduct(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return RedirectToAction("Danhmucsanpham");
            }
            await _productRepository.DeleteProduct(id);
            return RedirectToAction("Danhsachsanpham");
        }

        [HttpGet]
        public async Task<ActionResult> EditProduct(string id)
        {
            var product = await _productRepository.GetProductById(id);
            if (product != null)
            {
                string categoryId = string.IsNullOrEmpty(product.CategoryId) ? string.Empty : product.CategoryId;
                string discountId = string.IsNullOrEmpty(product.DiscountId) ? string.Empty : product.DiscountId;
                ViewBag.Product = product;
                var productToReturn = new
                {
                    ProductId = product.ProductId.ToString(),
                    product.ProductName,
                    CategoryId = categoryId,
                    product.Price,
                    product.StockQuantity,
                    product.Weight,
                    product.ProductDescription,
                    DiscountId = discountId,
                    product.Rating,
                    product.Pieces,
                    product.SecondPrice,
                };
                return Json(productToReturn, JsonRequestBehavior.AllowGet);
            }
            return HttpNotFound();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> UpdateProduct(updateProduct product)
        {
            if (ObjectId.TryParse(product.ProductId.ToString(), out ObjectId productId))
            {
                string categoryId = string.IsNullOrEmpty(product.CategoryId) ? "Trống" : product.CategoryId;
                string discountId = string.IsNullOrEmpty(product.DiscountId) ? "Trống" : product.DiscountId;
                Product updatedProduct = new Product
                {
                    ProductId = productId,
                    ProductName = product.ProductName,
                    CategoryId = categoryId,
                    Price = product.Price,
                    StockQuantity = product.StockQuantity,
                    Weight = product.Weight,
                    ProductDescription = product.ProductDescription,
                    DiscountId = discountId,
                    Rating = product.Rating,
                    Pieces = product.Pieces,
                    SecondPrice = product.SecondPrice,
                };

                await _productRepository.UpdateProduct(updatedProduct);
            }
            else
            {
                ModelState.AddModelError("DiscountId", "Mã Giảm Giá không hợp lệ.");
                return View("Danhsachsanpham");
            }
            return RedirectToAction("Danhsachsanpham");
        }

        [HttpPost]
        public async Task<ActionResult> AddProduct(updateProduct product)
        {
            ObjectId productId = ObjectId.GenerateNewId();

            Product newProduct = new Product
            {
                ProductId = productId,
                ProductName = product.ProductName,
                CategoryId = product.CategoryId,
                Price = product.Price,
                StockQuantity = product.StockQuantity,
                Weight = product.Weight,
                ProductDescription = product.ProductDescription,
                DiscountId = product.DiscountId,
                Rating = 0,
                Pieces = product.Pieces,
                SecondPrice = product.SecondPrice,
            };
                await _productRepository.AddProduct(newProduct);
                
            return RedirectToAction("Danhsachsanpham");
        }

        [AuthorizeAdminFilter]
        public async Task<ActionResult> Danhmucsanpham(int page = 1, int pageSize = 1)
        {
            var categories = await _categoryRepository.GetAllCategories(page, pageSize);
            var totalCategories = await _categoryRepository.GetAllCategoriesCount();
            var totalPages = (int)Math.Ceiling((double)totalCategories / pageSize);

            ViewBag.TotalPages = totalPages;
            ViewBag.CurrentPage = page;

            return View(categories);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> AddCategory(Category category)
        {
            if (ModelState.IsValid)
            {
                await _categoryRepository.AddCategory(category);
                return RedirectToAction("Danhmucsanpham");
            }
            return View();
        }

        public async Task<ActionResult> EditCategory(string id)
        {
            var category = await _categoryRepository.GetCategoryById(id);

            if (category != null)
            {
                var categoryToReturn = new updateCategory
                {
                    CategoryId = category.CategoryId.ToString(),
                    CategoryName = category.CategoryName
                };

                return Json(categoryToReturn, JsonRequestBehavior.AllowGet);
            }

            return HttpNotFound();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> UpdateCategory(updateCategory category)
        {
            if (!string.IsNullOrEmpty(category.CategoryName))
            {
                if (ObjectId.TryParse(category.CategoryId, out ObjectId categoryId))
                {
                    Category updatedCategory = new Category
                    {
                        CategoryId = categoryId,
                        CategoryName = category.CategoryName
                    };

                    await _categoryRepository.UpdateCategory(updatedCategory);
                }
                else
                {
                    ModelState.AddModelError("CategoryId", "Mã Loại Sản Phẩm không hợp lệ.");
                    return View(category);
                }
            }
            else
            {
                ModelState.AddModelError("CategoryName", "Tên Danh Mục không thể trống.");
                return View(category);
            }

            return RedirectToAction("Danhmucsanpham");
        }


        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> DeleteCategory(string id)
        {
            if (!string.IsNullOrEmpty(id))
            {
                await _categoryRepository.DeleteCategory(id);
            }
            return RedirectToAction("Danhmucsanpham");
        }
        [AuthorizeAdminFilter]
        public async Task<ActionResult> Danhmucgiamgia()
        {
            var discounts = await _discountRepository.GetAllDiscounts();
            return View(discounts);
        }

        public async Task<ActionResult> AddDiscount(Discount discount)
        {
            if (ModelState.IsValid)
            {
                await _discountRepository.AddDiscount(discount);
                return RedirectToAction("Danhmucgiamgia");
            }
            return View();
        }

        public async Task<ActionResult> EditDiscount(string id)
        {
            var discount = await _discountRepository.GetDiscountById(id);
            if (discount != null)
            {
                return Json(new
                {
                    DiscountId = discount.DiscountId.ToString(),
                    DiscountPercentage = discount.DiscountPercentage,
                    DiscountDescription = discount.DiscountDescription
                }, JsonRequestBehavior.AllowGet);
            }
            return HttpNotFound();
        }

        public async Task<ActionResult> UpdateDiscount(updateDiscount discount)
        {
            if (!string.IsNullOrEmpty(discount.DiscountDescription) && discount.DiscountPercentage > 0)
            {
                if (ObjectId.TryParse(discount.DiscountId, out ObjectId discountId))
                {

                    Discount updatedDiscount = new Discount
                    {
                        DiscountId = discountId,
                        DiscountPercentage = discount.DiscountPercentage,
                        DiscountDescription = discount.DiscountDescription
                    };

                    await _discountRepository.UpdateDiscount(updatedDiscount);
                }
                else
                {
                    ModelState.AddModelError("DiscountId", "Mã Giảm Giá không hợp lệ.");
                    return View(discount);
                }
            }
            else
            {
                ModelState.AddModelError("DiscountDescription", "Mô Tả Giảm Giá không thể trống.");
                ModelState.AddModelError("DiscountPercentage", "Phần Trăm Giảm Giá không thể trống.");
                return View(discount);
            }
            return RedirectToAction("Danhmucgiamgia");
        }

        [HttpGet]
        public async Task<ActionResult> GetProductImages(string productId)
        {
            var images = await _imageRepository.GetImagesByProductId(productId);
            return Json(images, JsonRequestBehavior.AllowGet);
        }

        public async Task<ActionResult> DeleteDiscount(string id)
        {
            if (!string.IsNullOrEmpty(id))
            {
                await _discountRepository.DeleteDiscount(id);
            }
            return RedirectToAction("Danhmucgiamgia");
        }

        [HttpPost]
        public async Task<ActionResult> DeleteImages()
        {
            var imageIdsJson = Request.Form["imageIds"];

            var imageIdss = JsonConvert.DeserializeObject<List<string>>(imageIdsJson);
            foreach (var imageId in imageIdss)
            {
                await _imageRepository.DeleteImage(imageId);
            }

            return Json(new { success = true, message = "Xóa ảnh thành công!" });
        }


        [HttpPost]
        public async Task<ActionResult> AddImages()
        {
            var imagesJson = Request.Form["images"];
            var productId = Request.Form["productId"];

            if (string.IsNullOrEmpty(imagesJson) || string.IsNullOrEmpty(productId))
            {
                return Json(new { success = false, message = "Dữ liệu không hợp lệ" });
            }

            try
            {
                var images = JsonConvert.DeserializeObject<List<Image>>(imagesJson);

                foreach (var image in images)
                {
                    image.ImageId = ObjectId.GenerateNewId();

                    var mimeType = GetMimeTypeFromBase64(image.ImageData);
                    image.MIMEType = mimeType;
                    image.ProductId = productId;
                    image.Tag = "Products";
                    await _imageRepository.AddImage(image);
                }

                return Json(new { success = true, message = "Lưu ảnh thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Có lỗi xảy ra khi lưu ảnh: " + ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> AddImagesAvatar()
        {
            var imageJson = Request.Form["imagess"];
            var productId = Request.Form["productID"]; 

            if (string.IsNullOrEmpty(imageJson) || string.IsNullOrEmpty(productId))
            {
                return Json(new { success = false, message = "Dữ liệu không hợp lệ" });
            }

            try
            {
                var avatarImage = JsonConvert.DeserializeObject<Image>(imageJson);
                if (!string.IsNullOrEmpty(avatarImage?.ImageData))
                {
                    if (avatarImage != null)
                    {
                        avatarImage.ImageId = ObjectId.GenerateNewId(); 
                        avatarImage.MIMEType = GetMimeTypeFromBase64(avatarImage.ImageData);  
                        avatarImage.ProductId = productId;
                        avatarImage.Tag = "Products"; 
                        avatarImage.Order = "1";  

                        await _imageRepository.AddImage(avatarImage);

                        return Json(new { success = true, message = "Lưu ảnh đại diện thành công!" });
                    }
                }

                return Json(new { success = false, message = "Không có ảnh để lưu." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Có lỗi xảy ra khi lưu ảnh đại diện: " + ex.Message });
            }
        }


        [HttpGet]
        public async Task<ActionResult> EditImage(string ProductId)
        {
            var imgs = await _imageRepository.GetImagesByProductId(ProductId);
            var imageList = imgs.OrderBy(img => img.Order).Select(img => new detailImage
            {
                ImageId = img.ImageId.ToString(),
                Order = img.Order,
                ImageData = img.ImageData
            });

            return Json(imageList, JsonRequestBehavior.AllowGet);
        }

        private string GetMimeTypeFromBase64(string base64Data)
        {
            if (base64Data.StartsWith("data:image/jpeg"))
            {
                return "image/jpeg";
            }
            else if (base64Data.StartsWith("data:image/png"))
            {
                return "image/png";
            }
            else if (base64Data.StartsWith("data:image/gif"))
            {
                return "image/gif";
            }
            else
            {
                return "application/octet-stream";
            }
        }

        [HttpPost]
        public async Task<ActionResult> UpdateOrder()
        {
            // Nhận dữ liệu từ form
            var updateOrderJson = Request.Form["updateOrder"];
            var productId = Request.Form["productId"];

            if (string.IsNullOrEmpty(updateOrderJson) || string.IsNullOrEmpty(productId))
            {
                return Json(new { success = false, message = "Dữ liệu không hợp lệ" });
            }

            try
            {
                var updateOrderList = JsonConvert.DeserializeObject<List<UpdateOrderModel>>(updateOrderJson);

                foreach (var item in updateOrderList)
                {
                    await _imageRepository.UpdateOrder(item.ImageId, item.Order);
                }

                return Json(new { success = true, message = "Cập nhật thứ tự ảnh thành công!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Có lỗi xảy ra khi cập nhật thứ tự ảnh: " + ex.Message });
            }
        }

        public ActionResult Danhsachdonhang()
        {
            return View();
        }
        
        public ActionResult Danhsachkhachhang()
        {
            return View();
        }
        
        public ActionResult Danhsachnhanvien()
        {
            return View();
        }
      
        public ActionResult Danhsachtaikhoan()
        {
            return View();
        }
      
    }
}