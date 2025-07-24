import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AddToCartService } from '../services/add-to-cart.service';
import { FavouriteService } from '@services/favourite.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [RouterModule, CommonModule]
})
export class HomeComponent implements OnInit {
  noibatProducts: any[] = [];
  goiyProducts: any[] = [];

  constructor(private http: HttpClient, private cartService: AddToCartService, private favouriteService: FavouriteService) {}

  ngOnInit(): void {
    this.loadNoibatProducts();  // Tải sản phẩm nổi bật
    this.loadGoiyProducts();    // Tải sản phẩm gợi ý
  }

  // Tải sản phẩm nổi bật
  async loadNoibatProducts() {
    try {
      // 1. Lấy tất cả các tài liệu trong collection Favourites
      const favourites: any = await this.http.get("http://localhost:3000/collections/Favourites").toPromise();
      const productCount: { [key: string]: number } = {};
  
      // Đếm số lượt yêu thích của mỗi sản phẩm
      favourites.forEach((favDoc: any) => {
        if (Array.isArray(favDoc.Favourite)) {
          favDoc.Favourite.forEach((fav: any) => {
            productCount[fav.Product_ID] = (productCount[fav.Product_ID] || 0) + 1;
          });
        }
      });
  
      // 2. Lấy danh sách sản phẩm từ collection Products
      const products: any = await this.http.get("http://localhost:3000/collections/Products").toPromise();
  
      // 3. Chuẩn hóa số likes
      const maxLikes = Math.max(...Object.values(productCount), 1); // tránh chia 0
  
      // 4. Tính điểm dựa trên Likes + Rating
      const weightedProducts = products.map((product: any) => {
        const likes = productCount[product.Product_ID] || 0;
        const likesNormalized = Math.log(1 + likes) / Math.log(1 + maxLikes);
        const ratingNormalized = product.Rating / 5;
  
        // Trọng số (Likes + Rating)
        const W1 = 0.5; // Likes
        const W2 = 0.5; // Rating
  
        const score = W1 * likesNormalized + W2 * ratingNormalized;
  
        return { ...product, score };
      });
  
      // 5. Lấy Top 4 sản phẩm có điểm cao nhất
      const topProducts = weightedProducts
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 4);
  
      // 6. Gán vào noibatProducts
      this.noibatProducts = topProducts;
  
    } catch (error) {
      console.error("Lỗi tải dữ liệu sản phẩm nổi bật:", error);
    }
  }
  
  // Tải sản phẩm gợi ý
  async loadGoiyProducts() {
    try {
      // 1. Lấy tất cả các tài liệu trong collection Favourites
      const favourites: any = await this.http.get("http://localhost:3000/collections/Favourites").toPromise();
      const productCount: { [key: string]: number } = {};
  
      // Đếm số lượt yêu thích của mỗi sản phẩm
      favourites.forEach((favDoc: any) => {
        if (Array.isArray(favDoc.Favourite)) {
          favDoc.Favourite.forEach((fav: any) => {
            productCount[fav.Product_ID] = (productCount[fav.Product_ID] || 0) + 1;
          });
        }
      });
  
      // 2. Lấy danh sách sản phẩm từ collection Products
      const products: any = await this.http.get("http://localhost:3000/collections/Products").toPromise();
  
      // 3. Chuẩn hóa số likes
      const maxLikes = Math.max(...Object.values(productCount), 1); // tránh chia 0
  
      // 4. Tính điểm dựa trên Likes + Discount + Rating
      const weightedProducts = products.map((product: any) => {
        const likes = productCount[product.Product_ID] || 0;
        const likesNormalized = Math.log(1 + likes) / Math.log(1 + maxLikes);
  
        // Tính Discount Ratio: 1 - (Second_Price / Price)
        let discountRatio = 0;
        if (product.Price && product.Second_Price && product.Price > 0) {
          discountRatio = 1 - (product.Second_Price / product.Price);
          // Giới hạn trong khoảng 0-1
          discountRatio = Math.max(0, Math.min(discountRatio, 1));
        }
  
        const ratingNormalized = product.Rating / 5;
  
        // Trọng số
        const W1 = 0.25; // Likes
        const W2 = 0.4;  // Discount
        const W3 = 0.35; // Rating
  
        const score = W1 * likesNormalized + W2 * discountRatio + W3 * ratingNormalized;
  
        return { ...product, score };
      });
  
      // 5. Lấy Top 4 sản phẩm có điểm cao nhất
      const topProducts = weightedProducts
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 4);
  
      // 6. Gán vào goiyProducts
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
}
