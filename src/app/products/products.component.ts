import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AddToCartService } from '../services/add-to-cart.service';
import { FavouriteService } from '@services/favourite.service';


@Component({
  selector: 'app-products',
  standalone: true, 
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  imports: [CommonModule,RouterModule]
})
export class ProductsComponent implements OnInit {

  products: any[] = []; // Danh sách tất cả sản phẩm từ API
  filteredProducts: any[] = []; // Danh sách sản phẩm đã lọc
  categories: any[] = []; // Danh sách danh mục
  selectedCategories: Set<string> = new Set(); // Lưu danh sách Category_ID được chọn
  selectedStock: Set<string> = new Set(); // Lưu tình trạng hàng được chọn ("in-stock", "out-of-stock")
  selectedPrices: Set<string> = new Set(); // Lưu mức giá được chọn
  
  constructor(
    private http: HttpClient,
    private cartService: AddToCartService,
    private favouriteService: FavouriteService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    
  }

  async loadCategories() {
    try {
      const categoriesResponse = await firstValueFrom(
        this.http.get<any[]>('http://localhost:3000/collections/Categories')
      );
      this.categories = categoriesResponse;
    } catch (error) {
      console.error('Lỗi tải danh mục', error);
    }
  }

  async loadProducts() {
    try {
      const productsResponse = await firstValueFrom(
        this.http.get<any[]>('http://localhost:3000/collections/Products')
      );
      this.products = productsResponse || [];
      this.applyFilters();
    } catch (error) {
      console.error('Lỗi tải sản phẩm:', error);
    }
  }


  // Cập nhật danh mục được chọn
  toggleCategory(categoryId: string) {
    if (this.selectedCategories.has(categoryId)) {
      this.selectedCategories.delete(categoryId);
    } else {
      this.selectedCategories.add(categoryId);
    }
    this.applyFilters();
  }

  // Cập nhật tình trạng hàng
  toggleStock(status: string) {
    if (this.selectedStock.has(status)) {
      this.selectedStock.delete(status);
    } else {
      this.selectedStock.add(status);
    }
    this.applyFilters();
  }

  // Cập nhật bộ lọc giá
  togglePrice(priceRange: string) {
    if (this.selectedPrices.has(priceRange)) {
      this.selectedPrices.delete(priceRange);
    } else {
      this.selectedPrices.add(priceRange);
    }
    this.applyFilters();
  }

  // Áp dụng tất cả bộ lọc
  applyFilters() {
    this.filteredProducts = this.products.filter(product => {
      let categoryMatch = this.selectedCategories.size > 0 
        ? this.selectedCategories.has(product.Category_ID) 
        : true;

      let stockMatch = this.selectedStock.size > 0 
        ? (this.selectedStock.has('in-stock') && product.Stock_Quantity > 0) || 
          (this.selectedStock.has('out-of-stock') && product.Stock_Quantity === 0)
        : true;

      let priceMatch = true;
      if (this.selectedPrices.size > 0) {
        const price = product.Price || 0;
        priceMatch = [...this.selectedPrices].some(priceFilter => {
          switch (priceFilter) {
            case 'below-100k':
              return price < 100000;
            case '100k-499k':
              return price >= 100000 && price <= 499000;
            case '500k-999k':
              return price >= 500000 && price <= 999000;
            case '1m-1.999m':
              return price >= 1000000 && price <= 1999000;
            case '2m-4.999m':
              return price >= 2000000 && price <= 4999000;
            case '5m-9.999m':
              return price >= 5000000 && price <= 9999000;
            case 'above-10m':
              return price > 10000000;
            default:
              return true;
          }
        });
      }

      return categoryMatch && stockMatch && priceMatch;
    });
  }

  addToCart(productId: string) {
    this.cartService.addToCart(productId).subscribe(
      response => {
        console.log(response);
        alert('Sản phẩm đã được thêm vào giỏ hàng!');
      },
      error => {
        console.error(error);
        alert('Có lỗi khi thêm sản phẩm vào giỏ hàng!');
      }
    );
  }
  addToFavourite(productId: string) {
    this.favouriteService.toggleFavourite(productId).subscribe(
      response => {
        console.log(response);

        // Kiểm tra phản hồi từ server và đưa ra thông báo tương ứng
        if (response.message.includes('thêm')) {
          alert('Sản phẩm đã được thêm vào danh sách yêu thích!');
        } else if (response.message.includes('xoá')) {
          alert('Sản phẩm đã được xoá khỏi danh sách yêu thích!');
        }
      },
      error => {
        console.error(error);
        alert('Có lỗi khi thao tác với danh sách yêu thích!');
      }
    );
  }
}
