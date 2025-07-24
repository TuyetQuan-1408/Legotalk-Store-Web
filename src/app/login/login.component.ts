import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  identifier: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Check if the user is already logged in
    this.authService.user$.subscribe(user => {
      if (user) {
        // If the user is logged in, redirect to home
        this.router.navigate(['/home']);
      }
    });
  }

  login() {
    this.authService.login(this.identifier, this.password).subscribe({
      next: () => {
        console.log("Đăng nhập thành công!");
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Lỗi đăng nhập:', err);
        this.errorMessage = err.error?.error || "Đăng nhập thất bại!";
      }
    });
  }
}
