import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-info-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './info-register.component.html',
  styleUrls: ['./info-register.component.css']
})
export class InfoRegisterComponent implements OnInit {
  name: string = '';
  gender: string = '';
  dob: string = ''; 
  phone: string = '';
  errorMessage: string = '';
  email: string = '';
  
  // Dữ liệu từ bước đăng ký trước
  tempData: any = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    try {
      const storedData = sessionStorage.getItem('tempRegisterData');
      if (!storedData) {
        this.errorMessage = "Session expired. Please register again.";
        setTimeout(() => this.router.navigate(['/register']), 2000);
        return;
      }
      
      this.tempData = JSON.parse(storedData);
      console.log('Temporary registration data loaded:', this.tempData);

      
      // Điền sẵn phone và email nếu có
      
      this.name = 'Customer';
      this.email = this.tempData.email || '';
      this.phone = this.tempData.phone || '';

    } catch (error) {
      console.error('Error loading temporary data:', error);
      this.errorMessage = "Error loading session data. Please register again.";
      setTimeout(() => this.router.navigate(['/register']), 2000);
    }
  }

  completeRegistration() {
    if (!this.tempData) {
      this.errorMessage = "Session expired. Please register again.";
      setTimeout(() => this.router.navigate(['/register']), 2000);
      return;
    }

    // Kết hợp dữ liệu từ form với dữ liệu đăng ký ban đầu
    const finalUserData = {
      phone: this.tempData.phone,
      email: this.tempData.email,
      hashedPassword: this.tempData.hashedPassword,
      tempToken: this.tempData.token,
      name: this.name,
      gender: this.gender,
      dob: this.dob,
    };

    console.log('Sending complete registration data:', finalUserData);

    this.http.post('http://localhost:3000/info-register', finalUserData).subscribe({
      next: (response) => {
        console.log('Registration complete:', response);
        sessionStorage.removeItem('tempRegisterData');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Complete registration error:', err);
        this.errorMessage = err.error?.error || "Registration failed!";
        
        
      }
    });
  }
}