import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  imports: [CommonModule,FormsModule,RouterModule],
  providers: [CurrencyPipe]
})
export class CartComponent implements OnInit {
  userId: string | null = null;
  cartItems: any[] = [];
  totalAmount: number = 0;
  discountAmount: number = 0; // Số tiền giảm giá
  discountCode: string = ''; // Mã giảm giá nhập vào
  discountCodeOut: string= '';
  totalAmountItems: number = 0;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    // Lấy userId từ token
    this.userId = this.authService.getUserIdFromToken();

    if (this.userId) {
      this.getCartItems();
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Lấy giỏ hàng của người dùng
  getCartItems() {
    const customerId = this.authService.getUserIdFromToken(); // Lấy Customer_ID từ token

    if (!customerId) {
      console.error('Customer_ID không hợp lệ');
      return;
    }

    // Gửi yêu cầu để lấy giỏ hàng của người dùng
    this.http.get<any[]>(`http://localhost:3000/collections/Carts`).subscribe(
      (data) => {
        const customerCart = data.find(item => item.Customer_ID === customerId);

        if (customerCart) {
          this.cartItems = customerCart.Cart || [];

          // Cập nhật lại tổng số lượng sản phẩm
          this.calculateTotalAmount();

          // Lấy thông tin chi tiết cho mỗi sản phẩm trong giỏ hàng
          this.cartItems.forEach((item, index) => {
            this.http.get<any>(`http://localhost:3000/collections/Products/${item.Product_ID}`).subscribe(
              (product) => {
                this.cartItems[index].Product_Name = product.Product_Name;
                this.cartItems[index].Price = product.Price;
                this.cartItems[index].Second_Price = product.Second_Price;

                // Cập nhật lại tổng giỏ hàng
                this.calculateTotal();
              },
              (error) => {
                console.error('Lỗi khi lấy thông tin sản phẩm:', error);
              }
            );
          });
        } else {
          this.cartItems = [];
        }
      },
      (error) => {
        console.error('Lỗi khi lấy thông tin giỏ hàng:', error);
      }
    );
  }

  // Tính tổng số lượng sản phẩm
  calculateTotalAmount() {
    this.totalAmountItems = this.cartItems.reduce((total, item) => total + (item.Amount || 0), 0);
  }

  // Cập nhật tổng giỏ hàng
  calculateTotal() {
    let total = 0;
  
    // Tính tổng tất cả các sản phẩm trong giỏ hàng
    this.cartItems.forEach(item => {
      const price = (item.Second_Price > 0) ? item.Second_Price : item.Price; 
      const quantity = item.Amount || 0;
  
      total += price * quantity;
    });
  
    
    this.totalAmount = total;
  }
  
  // Hàm thay đổi số lượng sản phẩm và reset giảm giá
  changeQuantity(item: any, change: number) {
    const newQuantity = item.Amount + change;
    if (newQuantity >= 0) {
      item.Amount = newQuantity;
      this.discountAmount = 0;  
      this.calculateTotal();  
      this.calculateTotalAmount();
      this.updateQuantityInDB(item);
    }
  }

  // Hàm để cập nhật số lượng sản phẩm trong cơ sở dữ liệu
  updateQuantityInDB(item: any) {
    const customerId = this.authService.getUserIdFromToken(); // Lấy Customer_ID từ token

    if (!customerId) {
      console.error('Không tìm thấy Customer_ID');
      return;
    }

    // Gửi yêu cầu PUT để cập nhật số lượng trong giỏ hàng
    this.http.put(`http://localhost:3000/collections/Carts/updateQuantity`, {
      customerId: customerId,
      productId: item.Product_ID, // Truyền `Product_ID` của sản phẩm
      amount: item.Amount // Cập nhật số lượng mới
    }).subscribe(
      (response) => {
        console.log('Cập nhật số lượng sản phẩm thành công');
      },
      (error) => {
        console.error('Lỗi khi cập nhật số lượng trong cơ sở dữ liệu:', error);
      }
    );
  }

  removeItem(item: any) {
    const customerId = this.authService.getUserIdFromToken(); // Lấy Customer_ID từ token
    
    if (!customerId) {
      console.error('Không tìm thấy Customer_ID');
      return;
    }
  
    // Gửi yêu cầu PUT để xóa sản phẩm khỏi giỏ hàng trong cơ sở dữ liệu
    this.http.put(`http://localhost:3000/collections/Carts`, {
      customerId: customerId,
      productId: item.Product_ID // Truyền `Product_ID` và `Amount` của sản phẩm muốn xóa
    }).subscribe(
      (response) => {
        console.log('Xóa sản phẩm thành công từ cơ sở dữ liệu');
        
        // Xóa sản phẩm khỏi giỏ hàng trong ứng dụng
        const index = this.cartItems.indexOf(item);
        if (index !== -1) {
          this.cartItems.splice(index, 1);  // Xóa sản phẩm khỏi giỏ hàng
          this.discountAmount = 0;  
          this.calculateTotal();  
          this.calculateTotalAmount();
        }
      },
      (error) => {
        console.error('Lỗi khi xóa sản phẩm khỏi cơ sở dữ liệu:', error);
      }
    );
  }
  

  // Hàm áp dụng mã giảm giá
  applyDiscount() {
    if (!this.discountCode) {
      alert('Vui lòng nhập mã giảm giá');
      return;
    }

    // Gửi yêu cầu để lấy tất cả các mã giảm giá
    this.http.get<any[]>(`http://localhost:3000/collections/Discounts`).subscribe(
      (discounts) => {
        const discount = discounts.find(d => d.Discount_Code === this.discountCode);

        if (discount) {
          // Tính toán giảm giá
          const discountPercentage = discount.Percentage;
          const totalBeforeDiscount = this.cartItems.reduce((sum, item) => sum + (item.Price * item.Amount), 0);
          this.discountAmount = (totalBeforeDiscount * discountPercentage) / 100;
          this.discountCodeOut= this.discountCode 
          alert(`Mã giảm giá ${this.discountCode} áp dụng thành công! Giảm ${discountPercentage}%`);
          const paymentData = {
            totalAmount: this.totalAmount,
            discountAmount: this.discountAmount,
            totalAmountItems: this.totalAmountItems,
            cartItems: this.cartItems,
            discountCodeOut: this.discountCode 
          };
        } else {
          alert('Mã giảm giá không hợp lệ');
        }
      },
      (error) => {
        console.error('Lỗi khi lấy mã giảm giá:', error);
      }
    );
  }

  goToPayment() {
    const paymentData = {
      totalAmount: this.totalAmount,
      discountAmount: this.discountAmount,
      totalAmountItems: this.totalAmountItems,
      cartItems: this.cartItems,
      discountCodeOut: this.discountCodeOut,
      userId: this.userId
    };

    sessionStorage.setItem('paymentData', JSON.stringify(paymentData));
    this.router.navigate(['/payment']);
  }
}
