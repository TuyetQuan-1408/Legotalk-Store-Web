import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';  // Import AuthService

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.css'] // Adjusted to match your original path
})
export class RegisterComponent implements OnInit {
  phone: string = '';
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  ngOnInit() {
    // Check if the user is already logged in
    this.authService.user$.subscribe(user => {
      if (user) {
        // If the user is logged in, redirect to home
        this.router.navigate(['/home']);
      }
    });
  }

  register() {
    // Kiểm tra số điện thoại: phải có 10 chữ số
    const phonePattern = /^\d{10}$/;
    if (!phonePattern.test(this.phone)) {
      this.errorMessage = "Số điện thoại phải có đúng 10 chữ số.";
      return;
    }

    // Kiểm tra email: đúng định dạng
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.email)) {
      this.errorMessage = "Email không hợp lệ.";
      return;
    }

    const userData = {
      phone: this.phone,
      email: this.email,
      password: this.password
    };

    this.http.post<any>('http://localhost:3000/register', userData).subscribe({
      next: (response: any) => {
        console.log('Registration data received:', response);

        // Kiểm tra phản hồi từ server
        if (response.tempRegisterData) {
          console.log("Response from server:", response.tempRegisterData);

          sessionStorage.setItem('tempRegisterData', JSON.stringify(response.tempRegisterData));
          this.router.navigate(['/info-register']);
        } else {
          this.errorMessage = "Invalid response from server";
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.error || "Đăng ký thất bại!";
      }
    });
  }
}
