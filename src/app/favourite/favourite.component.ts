import { Component, OnInit } from '@angular/core';
import { FavouriteService } from '@services/favourite.service';
import { AddToCartService } from '../services/add-to-cart.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '@services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-favourite',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './favourite.component.html',
  styleUrls: ['./favourite.component.css'],
})
export class FavouriteComponent implements OnInit {
  favoriteProducts: any[] = [];
  userId: string | null = null;

  constructor(
    private favouriteService: FavouriteService,
    private cartService: AddToCartService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Lấy userId từ token
    this.userId = this.authService.getUserIdFromToken();

    if (this.userId) {
      this.getFavouriteItems();
    } else {
      this.router.navigate(['/login']);
    }
  }

  getFavouriteItems() {
    const customerId = this.authService.getUserIdFromToken(); // Lấy Customer_ID từ token

    if (!customerId) {
      console.error('Customer_ID không hợp lệ');
      return;
    }

    // Gửi yêu cầu để lấy danh sách yêu thích của người dùng
    this.http.get<any[]>(`http://localhost:3000/collections/Favourites`).subscribe(
      (data) => {
        const customerFavourite = data.find(item => item.Customer_ID === customerId);

        if (customerFavourite) {
          this.favoriteProducts = customerFavourite.Favourite || []; 

          // Lấy thông tin chi tiết cho mỗi sản phẩm trong yêu thích
          this.favoriteProducts.forEach((item, index) => {
            // Sử dụng Product_ID để lấy thông tin sản phẩm từ cơ sở dữ liệu
            this.http.get<any>(`http://localhost:3000/collections/Products/${item.Product_ID}`).subscribe(
              (product) => {
                // Cập nhật thông tin chi tiết sản phẩm vào danh sách yêu thích
                this.favoriteProducts[index].Product_Name = product.Product_Name;
                this.favoriteProducts[index].Price = product.Price;
                this.favoriteProducts[index].Second_Price = product.Second_Price;
              },
              (error) => {
                console.error('Lỗi khi lấy thông tin sản phẩm:', error);
              }
            );
          });
        } else {
          this.favoriteProducts = []; // Nếu không tìm thấy giỏ yêu thích, gán mảng rỗng
        }
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách yêu thích:', error);
      }
    );
  }

  addToCart(productId: string) {
    this.cartService.addToCart(productId).subscribe(
      response => {
        console.log('Added to cart:', response);
        alert('Sản phẩm đã được thêm vào giỏ hàng!');
      },
      error => {
        console.error('Error adding to cart:', error);
        alert('Lỗi khi thêm sản phẩm vào giỏ hàng: ' + (error.message || 'Unknown error'));
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
        this.getFavouriteItems();
      },
      error => {
        console.error(error);
        alert('Có lỗi khi thao tác với danh sách yêu thích!');
      }
    );
  }
}