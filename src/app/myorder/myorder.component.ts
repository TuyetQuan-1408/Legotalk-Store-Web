import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ProductRatingComponent } from '../product-rating/product-rating.component';
import { AddToCartService } from '../services/add-to-cart.service';
import { AuthService } from '../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-myorder',
  standalone: true,
  imports: [CommonModule, ProductRatingComponent,RouterModule],
  templateUrl: './myorder.component.html',
  styleUrls: ['./myorder.component.css']
})
export class MyorderComponent implements OnInit {
  orders: any[] = [];
  selectedProduct: any = null;

  constructor(
    private http: HttpClient,
    private cartService: AddToCartService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    const customerId = this.authService.getCustomerId();
    if (!customerId) {
      console.warn('User not logged in, cannot load orders.');
      this.orders = [];
      return;
    }

    console.log(`Loading orders for Customer_ID: ${customerId}`);
    this.http.get<any[]>(`http://localhost:3000/collections/Orders?Customer_ID=${customerId}`).subscribe(
      (orders) => {
        if (!orders || orders.length === 0) {
          console.log('No orders found for this customer.');
          this.orders = [];
          return;
        }

        console.log('Orders received from API:', orders);

        // Chuyển đổi dữ liệu để hiển thị từng sản phẩm trong mảng Products
        this.orders = [];
        orders.forEach(order => {
          if (order.Products && Array.isArray(order.Products)) {
            order.Products.forEach((product: any) => {
              this.orders.push({
                Order_ID: order.Order_ID || 'Unknown',
                Product_ID: product.Product_ID || 'Unknown',
                Product_Name: product.Product_Name || 'Unknown Product',
                Image_URL: product.Image_URL || 'https://via.placeholder.com/100',
                Quantity: product.Quantity || 1,
                Price: product.Price || 0,
                Amount: order.Amount || (product.Price * product.Quantity),
                DeliveryStatus: order.DeliveryStatus || 'Đang xử lý',
                Status: product.Status || 'CHỜ XÁC NHẬN'
              });
            });
          }
        });

        console.log('Processed orders for display:', this.orders);
      },
      (error) => {
        console.error('Error loading orders:', error);
        this.orders = [];
      }
    );
  }

  openRatingPopup(product: any) {
    this.selectedProduct = product;
  }

  closeRatingPopup() {
    this.selectedProduct = null;
  }

  addToCart(productId: string) {
    this.cartService.addToCart(productId).subscribe(
      response => {
        console.log('Added to cart:', response);
        alert('Sản phẩm đã được thêm vào giỏ hàng!');
      },
      error => {
        console.error('Error adding to cart:', error);
        alert('Lỗi khi thêm sản phẩm vào giỏ hàng!');
      }
    );
  }
}