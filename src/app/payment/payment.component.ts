import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  imports: [CommonModule,FormsModule]
})
export class PaymentComponent implements OnInit {
  totalAmount: number = 0;
  discountAmount: number = 0;
  totalAmountItems: number = 0;
  cartItems: any[] = [];
  discountCodeOut: string = '';
  userId: string | null = null;

  cities: any[] = [];  
  districts: any[] = []; 
  wards: any[] = [];  
  selectedCity: string = '';  
  selectedDistrict: string = '';  
  selectedWard: string = '';
  allAddresses: any[] = [];

  selectedPaymentMethod: string = '';  

  constructor(private router: Router,private http: HttpClient,private authService: AuthService) {}

  ngOnInit() {
    this.loadAddresses();
    // Lấy dữ liệu giỏ hàng từ sessionStorage
    const storedData = sessionStorage.getItem('paymentData');
    if (storedData) {
      const paymentData = JSON.parse(storedData);
      this.totalAmount = paymentData.totalAmount;
      this.discountAmount = paymentData.discountAmount;
      this.totalAmountItems = paymentData.totalAmountItems;
      this.cartItems = paymentData.cartItems;
      this.discountCodeOut = paymentData.discountCodeOut;
      this.userId = paymentData.userId;
    } else {
      console.error('No payment data found');
      this.router.navigate(['/cart']);
    }
  }

  // Lấy dữ liệu từ API
  loadAddresses() {
    this.http.get<any[]>('http://localhost:3000/collections/Address').subscribe(
      (addresses) => {
        this.allAddresses = addresses;  
        
        this.cities = this.getUniqueValues(addresses, 'Province');
      },
      (error) => {
        console.error('Lỗi khi lấy dữ liệu địa chỉ:', error);
      }
    );
  }

  // Lọc các giá trị duy nhất từ mảng theo tên trường
  getUniqueValues(data: any[], key: string): any[] {
    const uniqueValues = Array.from(new Set(data.map(item => item[key])));
    return uniqueValues.map(value => ({ name: value }));
  }

  // Khi thành phố/tỉnh được chọn, lấy quận/huyện tương ứng từ dữ liệu đã tải về
  onCityChange(selectedCity: string) {
    this.selectedCity = selectedCity;
    this.districts = []; 
    this.wards = [];  

    if (selectedCity) {
      // Lọc các quận/huyện duy nhất theo Province đã chọn từ dữ liệu đã tải về
      this.districts = this.getUniqueValues(
        this.allAddresses.filter(address => address.Province === selectedCity),
        'District'
      );
    }
  }

  // Khi quận/huyện được chọn, lấy xã/phường tương ứng
  onDistrictChange(selectedDistrict: string) {
    this.selectedDistrict = selectedDistrict;
    this.wards = [];  

    if (this.selectedCity && selectedDistrict) {
      // Lọc các xã/phường duy nhất theo District và Province đã chọn từ dữ liệu đã tải về
      this.wards = this.getUniqueValues(
        this.allAddresses.filter(address => address.Province === this.selectedCity && address.District === selectedDistrict),
        'Ward'
      );
    }
  }

  onCheckout() {
    
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
  
    
    const address = {
      Province: this.selectedCity,
      District: this.selectedDistrict,
      Ward: this.selectedWard,
      Street: (document.getElementById('address') as HTMLInputElement).value
    };
  
    if (!address.Province || !address.District || !address.Ward || !address.Street) {
      alert('Vui lòng nhập đầy đủ thông tin địa chỉ (Thành phố/Tỉnh, Quận/Huyện, Xã/Phường, Địa chỉ cụ thể).');
      return;
    }
  
    const name = (document.getElementById('name') as HTMLInputElement).value;
    const phone = (document.getElementById('phone') as HTMLInputElement).value;
  
    if (!name || !phone) {
      alert('Vui lòng nhập đầy đủ họ tên và số điện thoại người nhận.');
      return;
    }
  
    const orderData = {
      customerId: this.userId,
      paymentMethod: 'COD', 
      address: address,
      phone: phone,
      name: name,
      discountCodeOut: this.discountCodeOut,
      totalAmount: this.totalAmount-this.discountAmount,
      cartItems: this.cartItems
    };
  
    // Lấy token từ AuthService
    const token = this.authService.getToken();
    if (!token) {
      console.error('User is not authenticated!');
      this.router.navigate(['/login']);
      return;
    }
  
    // Gửi yêu cầu POST với token trong header Authorization
    this.http.post<any>('http://localhost:3000/checkout', orderData, {
      headers: {
        'Authorization': `Bearer ${token}`  
      },
      withCredentials: true
    }).subscribe(
      response => {
        console.log('Đặt hàng thành công', response);
        alert('Đặt hàng thành công!');
        
        // Cập nhật lại giỏ hàng (xóa sản phẩm đã thanh toán khỏi cartItems)
        this.cartItems = this.cartItems.filter(item => item.Amount <= 0);
        this.router.navigate(['/my-order']); 
      },
      error => {
        console.error('Lỗi khi thanh toán:', error);
        alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
      }
    );
  }
}
