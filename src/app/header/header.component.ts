import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule,FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  user: any = null;
  searchQuery: string = '';
  searchResults: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkUserStatus();
  }

  checkUserStatus() {
    if (this.authService.isLoggedIn()) {
      this.user = this.authService.getUser();
    } else {
      this.user = null;
    }

    this.authService.user$.subscribe(user => {
      this.user = user;
      this.cdr.detectChanges(); // Cập nhật giao diện ngay lập tức
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onSearch() {
    this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
  }

  goToProduct(productId: string) {
    this.router.navigate(['/product-detail', productId]);
  }
}
