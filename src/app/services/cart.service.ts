import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:3000/collections/Carts';

  constructor(private http: HttpClient) {}

  // Lấy giỏ hàng theo Customer_ID
  getCartItems(customerId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?customerId=${customerId}`);
  }
}
