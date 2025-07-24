import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';  
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AddToCartService {
  private apiUrl = 'http://localhost:3000';  

  constructor(private http: HttpClient, private authService: AuthService,private router: Router) {}

  // Phương thức thêm sản phẩm vào giỏ hàng
  addToCart(productId: string): Observable<any> {
    const token = this.authService.getToken();  // Lấy token từ AuthService

    if (!token) {
      this.router.navigate(['/login']);
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(`${this.apiUrl}/add-to-cart`, { productId }, { headers });
  }
}
