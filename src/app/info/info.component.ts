import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css'],
  imports: [CommonModule,FormsModule]
})
export class InfoComponent implements OnInit {
  name: string = '';
  gender: string = '';
  dob: string = ''; 
  phone: string = '';
  email: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Lấy customerId từ token thông qua AuthService
    const customerId = this.authService.getCustomerId();
    if (!customerId) {
      this.errorMessage = "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.";
      return;
    }

    // Lấy token từ AuthService
    const token = this.authService.getToken();

    if (!token) {
      this.errorMessage = "Không có token, vui lòng đăng nhập lại.";
      return;
    }

    // Cấu hình HTTP headers với token
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Lấy thông tin người dùng từ backend
    this.http.get<any>('http://localhost:3000/getUserInfo', { headers }).subscribe(
      (response) => {
        // Điền thông tin vào các trường input
        this.name = response.name || '';
        this.gender = response.gender || '';
        this.dob = response.dob || '';
        this.email = response.email || '';
        this.phone = response.phone || '';
      },
      (error) => {
        this.errorMessage = 'Không thể tải thông tin người dùng';
        console.error(error);
      }
    );
  }

  saveUserInfo() {
    // Kiểm tra nếu thông tin không hợp lệ
    if (!this.name || !this.email || !this.phone) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin';
      return;
    }

    const updatedUserData = {
      name: this.name,
      gender: this.gender || null,  // Nếu không có giới tính thì truyền null
      dob: this.dob || null,         // Nếu không có ngày sinh thì truyền null
      email: this.email,
      phone: this.phone
    };

    // Gửi thông tin người dùng đã chỉnh sửa để lưu vào backend
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put('http://localhost:3000/updateUserInfo', updatedUserData, { headers }).subscribe({
      next: (response) => {
        console.log('User data updated:', response);
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        console.error('Error updating user data:', err);
        this.errorMessage = 'Có lỗi xảy ra khi lưu thông tin';
      }
    });
  }
}