import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProductsComponent } from './products/products.component';
import { InfoRegisterComponent } from './info-register/info-register.component';
import { MyorderComponent } from './myorder/myorder.component';
import { CartComponent } from './cart/cart.component';
import { PaymentComponent } from './payment/payment.component';
import { FavouriteComponent } from './favourite/favourite.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { SearchComponent } from './search/search.component';
import { PolicyComponent } from './policy/policy.component';
import { AboutusComponent } from './aboutus/aboutus.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { Forgot1Component } from './forgot1/forgot1.component';
import { Forgot2Component } from './forgot2/forgot2.component';
import { Forgot3Component } from './forgot3/forgot3.component';
import { InfoComponent } from './info/info.component';
import { MainPostComponent } from './main-post/main-post.component';
import { Post1Component } from './post1/post1.component';
import { Post2Component } from './post2/post2.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, title:'legoTalk - Trang chủ' }, 
  { path: 'login', component: LoginComponent, title: 'Đăng nhập' },
  { path: 'register', component: RegisterComponent, title: 'Đăng ký' },
  { path: 'products', component: ProductsComponent, title: 'legoTalk - Sản phẩm' },
  { path: 'info-register', component: InfoRegisterComponent, title: 'Thông tin người dùng' },
  { path: 'my-order' , component: MyorderComponent, title: 'Đơn hàng'},
  { path: 'cart' , component: CartComponent, title: 'Giỏ hàng'},
  { path: 'payment' , component: PaymentComponent, title: 'Thanh toán'},
  { path: 'favourite', component: FavouriteComponent, title: 'Yêu thích'},
  { path: 'product-detail/:id', component: ProductDetailComponent},
  { path: 'product-details/:id', component: ProductDetailsComponent},
  { path: 'search', component: SearchComponent, title: 'legoTalk'},
  { path: 'policy', component: PolicyComponent, title: 'Điều khoản'},
  { path: 'about-us', component: AboutusComponent, title: 'Về chúng tôi'},
  { path: 'forgot/step1', component: Forgot1Component, title: 'Quên mật khẩu'},
  { path: 'forgot/step2', component: Forgot2Component, title: 'Quên mật khẩu'},
  { path: 'forgot/step3', component: Forgot3Component, title: 'Quên mật khẩu'},
  { path: 'info', component: InfoComponent, title: 'Thông tin người dùng'},
  { path: 'post', component: MainPostComponent, title: 'legoTalk - Bài viết'},
  { path: 'post/1', component: Post1Component, title: 'legoTalk - Bài viết 1'},
  { path: 'post/2', component: Post2Component, title: 'legoTalk - Bài viết 2'},

  { path: '**', redirectTo: '/home', pathMatch: 'full' },
];
