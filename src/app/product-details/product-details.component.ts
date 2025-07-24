import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AddToCartService } from '../services/add-to-cart.service';
import { ViewportScroller } from '@angular/common';
import { FavouriteService } from '@services/favourite.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['../product-detail/product-detail.component.css'],
  imports: [CommonModule,RouterModule]
})
export class ProductDetailsComponent implements OnInit, AfterViewInit {
  product: any = null; // Thông tin sản phẩm
  reviews: any[] = []; // Danh sách đánh giá
  filteredReviews: any[] = []; // Danh sách đánh giá đã lọc
  mainImage: string = ''; // Ảnh chính của sản phẩm
  imageList: string[] = []; // Danh sách ảnh
  totalReviews: number = 0; // Tổng số đánh giá
  ratingBreakdown: any = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }; // Phân tích đánh giá
  customersNames: Map<string, string> = new Map();
  selectedRating: number | null = null; // Lưu đánh giá được chọn để lọc
  goiyProducts: any[] = []; // Mảng chứa sản phẩm gợi ý

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient,
    private titleService: Title,
    private cartService: AddToCartService,
    private favouriteService: FavouriteService,
    private viewportScroller: ViewportScroller
  ) {}

  ngOnInit(): void {
    this.loadProductDetail();
    this.loadReviews();
    this.loadGoiyProducts();
  }

  ngAfterViewInit(): void {
    // Cuộn lên đầu sau khi view render (dự phòng)
    this.scrollToTop();
  }

  async loadProductDetail() {
    try {
      const productId = this.route.snapshot.paramMap.get('id');
      if (!productId) {
        console.error("Lỗi: Không tìm thấy ID sản phẩm.");
        return;
      }

      const productResponse = await this.http.get<any>(`http://localhost:3000/collections/Products/${productId}`).toPromise();
      this.product = productResponse;

      if (this.product && this.product.Product_Name) {
        this.titleService.setTitle(`${this.product.Product_Name}`);
      }
      

      this.imageList = await this.getExistingImages(productId);
      if (this.imageList.length > 0) {
        this.mainImage = this.imageList[0];
      }

    } catch (error) {
      console.error("Lỗi tải sản phẩm", error);
    }
  }

  async loadReviews() {
    try {
      const productId = this.route.snapshot.paramMap.get('id');
      if (!productId) {
        console.error("Lỗi: Không tìm thấy ID sản phẩm.");
        return;
      }

      const reviewsResponse = await this.http.get<any[]>(`http://localhost:3000/collections/Reviews`).toPromise();

      if (!reviewsResponse || !Array.isArray(reviewsResponse)) {
        console.warn("Không có đánh giá nào hoặc dữ liệu không hợp lệ.");
        this.reviews = [];
        this.totalReviews = 0;
        return;
      }

      this.reviews = reviewsResponse.filter(review => review.Product_ID === productId);
      this.totalReviews = this.reviews.length;

      this.ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

      this.reviews.forEach(async review => {
        const stars = review.Rating || 0;
        if (stars >= 1 && stars <= 5) {
          this.ratingBreakdown[stars]++;
        }

        if (!this.customersNames.has(review.Customer_ID)) {
          const customerName = await this.getCustomerNameFromAPI(review.Customer_ID);
          this.customersNames.set(review.Customer_ID, customerName);
        }
      });

      this.filteredReviews = [...this.reviews]; // Initially show all reviews

    } catch (error) {
      console.error("Lỗi tải đánh giá sản phẩm", error);
      this.reviews = [];
      this.totalReviews = 0;
      this.ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    }
  }

  // Filter reviews based on selected rating
  filterReviews(rating: number | null) {
    this.selectedRating = rating;

    if (rating === null) {
      this.filteredReviews = [...this.reviews]; // Show all reviews if no rating is selected
    } else {
      this.filteredReviews = this.reviews.filter(review => review.Rating === rating);
    }
  }

  async getCustomerNameFromAPI(customerId: string): Promise<string> {
    try {
      const response = await this.http.get<any>(`http://localhost:3000/getCustomerName/${customerId}`).toPromise();
      return response.Name || 'Unknown';
    } catch (error) {
      console.error("Lỗi tải tên khách hàng", error);
      return 'Unknown';
    }
  }

  async getExistingImages(productId: string): Promise<string[]> {
    const images: string[] = [];
    const maxImages = 20;

    for (let i = 1; i <= maxImages; i++) {
      const imageUrl = `http://localhost:3000/image/Products/${productId}/${i}`;
      if (await this.imageExists(imageUrl)) {
        images.push(imageUrl);
      } else {
        break;
      }
    }

    return images;
  }

  imageExists(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });
  }

  changeMainImage(imageUrl: string) {
    this.mainImage = imageUrl;
  }

  getCustomerName(customerId: string): string {
    return this.customersNames.get(customerId) || 'Unknown';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  }
  async loadGoiyProducts() {
    try {
      // Lấy thông tin sản phẩm hiện tại
      const productId = this.route.snapshot.paramMap.get('id');
      if (!productId) {
        console.error("Không tìm thấy ID sản phẩm.");
        return;
      }
  
      // Lấy thông tin sản phẩm hiện tại để lấy Category_ID
      const product: any = await this.http.get(`http://localhost:3000/collections/Products/${productId}`).toPromise();
      const currentCategoryID = product?.Category_ID;
  
      // Lấy danh sách yêu thích
      const favourites: any = await this.http.get("http://localhost:3000/collections/Favourites").toPromise();
      const productCount: { [key: string]: number } = {};
  
      // Đếm số lần xuất hiện của mỗi Product_ID trong danh sách Favourites, nhưng chỉ lọc theo Category_ID
      favourites.forEach((fav: any) => {
        // Kiểm tra xem sản phẩm có cùng Category_ID không
        const favProduct = favourites.find((item: any) => item.Product_ID === fav.Product_ID);
        if (favProduct?.Category_ID === currentCategoryID) {
          productCount[fav.Product_ID] = (productCount[fav.Product_ID] || 0) + 1;
        }
      });
  
      // Lọc ra 4 sản phẩm có số lần xuất hiện nhiều nhất
      const topProductIDs = Object.entries(productCount)
        .sort((a, b) => b[1] - a[1])  // Sắp xếp theo số lượt yêu thích
        .slice(0, 4)  // Lấy 4 sản phẩm có lượt yêu thích cao nhất
        .map(item => item[0]);
  
      // Lấy danh sách tất cả sản phẩm
      const products: any = await this.http.get("http://localhost:3000/collections/Products").toPromise();
      let topProducts = products.filter((productGy: any) => topProductIDs.includes(productGy.Product_ID) && productGy.Category_ID === currentCategoryID);
  
      // Loại trừ sản phẩm hiện tại khỏi danh sách gợi ý
      topProducts = topProducts.filter((productGy: any) => productGy.Product_ID !== productId);
  
      // Kiểm tra nếu số lượng sản phẩm gợi ý ít hơn 5 (có thể do loại trừ sản phẩm hiện tại)
      if (topProducts.length < 4) {
        // Lấy thêm 1 sản phẩm từ cùng Category_ID nếu không đủ 5 sản phẩm
        const remainingProducts = products.filter((productGy: any) => productGy.Category_ID === currentCategoryID && productGy.Product_ID !== productId);
        topProducts.push(...remainingProducts.slice(0, 4 - topProducts.length)); 
      }
  
      // Lưu sản phẩm vào mảng goiyProducts
      this.goiyProducts = topProducts;
    } catch (error) {
      console.error("Lỗi tải dữ liệu sản phẩm gợi ý:", error);
    }
  }
  
  addToCart(productId: string) {
    this.cartService.addToCart(productId).subscribe(
      response => {
        console.log(response);
        alert('Sản phẩm đã được thêm vào giỏ hàng!');
      },
      error => {
        console.error(error);
        alert('Có lỗi khi thêm sản phẩm vào giỏ hàng!');
      }
    );
  }

  addToFavourite(productId: string) {
    this.favouriteService.toggleFavourite(productId).subscribe(
      response => {
        console.log(response);

        // Kiểm tra phản hồi từ server và đưa ra thông báo tương ứng
        if (response.message.includes('thêm')) {
          alert('Sản phẩm đã được thêm vào danh sách yêu thích!');
        } else if (response.message.includes('xoá')) {
          alert('Sản phẩm đã được xoá khỏi danh sách yêu thích!');
        }
      },
      error => {
        console.error(error);
        alert('Có lỗi khi thao tác với danh sách yêu thích!');
      }
    );
  }
  
  private scrollToTop() {
    this.viewportScroller.scrollToPosition([0, 0]);
    console.log('Scrolled to top in ProductDetailComponent');
  }
}