import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-product-rating',
  imports: [FormsModule,CommonModule ],
  templateUrl: './product-rating.component.html',
  styleUrls: ['./product-rating.component.css']
})
export class ProductRatingComponent {
  @Input() product: any; // Nhận thông tin sản phẩm từ parent component
  @Output() close = new EventEmitter<void>(); // Sự kiện đóng pop-up
  @Output() addToCart = new EventEmitter<string>(); // Sự kiện thêm vào giỏ hàng

  rating: number = 0; // Số sao (1-5)
  deliveryFeedback: string = ''; // Đề xuất giao hàng (Comment)

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  setRating(star: number) {
    this.rating = star;
  }

  submitRating() {
    if (!this.rating) {
      alert('Vui lòng chọn số sao để đánh giá!');
      return;
    }

    const customerId = this.authService.getCustomerId();
    if (!customerId) {
      alert('Vui lòng đăng nhập để gửi đánh giá!');
      return;
    }

    const reviewData = {
      Product_ID: this.product.Product_ID,
      Order_ID: this.product.Order_ID,
      Rating: this.rating,
      Comment: this.deliveryFeedback,
      Customer_ID: customerId
    };

    this.http.post('http://localhost:3000/collections/Reviews', reviewData, { headers: this.getHeaders() }).subscribe(
      (response: any) => {
        console.log('Review submitted:', response);
        alert('Đánh giá đã được gửi thành công!');
        this.close.emit(); // Đóng pop-up
      },
      (error) => {
        console.error('Error submitting review:', error);
        alert('Lỗi khi gửi đánh giá: ' + (error.message || 'Unknown error'));
      }
    );
  }

  onAddToCart() {
    this.addToCart.emit(this.product.Product_ID); // Gửi Product_ID để thêm vào giỏ hàng
  }

  onClose() {
    this.close.emit(); // Đóng pop-up
  }
}