const express = require('express');
const { ObjectId } = require('mongodb');
const { connectToDb, getDb } = require('./db');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}));
app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY || "default_secret_key";

app.use(session({
    secret: 'mySecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 15 } // 15 phút
}));

let db;

connectToDb((err) => {
    if (err) {
        console.error("Failed to connect to database", err);
        process.exit(1);
    } else {
        app.listen(3000, () => {
            console.log('App listening on port 3000');
        });
        db = getDb();
    }
});


// ✅ API lấy tất cả collections và tài liệu của chúng
app.get('/collections', async (req, res) => {
    try {
        const collections = await db.listCollections().toArray();
        let data = {};
        for (let collection of collections) {
            data[collection.name] = await db.collection(collection.name).find().toArray();
        }
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: "Could not fetch the collections" });
    }
});



// ✅ API lấy một tài liệu cụ thể theo ID
app.get('/collections/:name/:id', async (req, res) => {
  try {
      const collectionName = req.params.name;
      
      // Chuyển id thành ObjectId để truy vấn
      const objectId = new ObjectId(req.params.id);
      
      // Tìm tài liệu trong collection theo ObjectId (mới là string của Product_ID)
      const document = await db.collection(collectionName).findOne({ _id: objectId });

      if (!document) {
          return res.status(404).json({ error: "Document not found" });
      }

      // Lấy giá trị Product_ID là string của ObjectId
      document.Product_ID = document._id.toString();

      // Trả về tài liệu cùng với Product_ID là string của ObjectId
      res.status(200).json(document);
  } catch (err) {
      console.error("Error fetching document:", err);
      res.status(500).json({ error: "Could not fetch the document" });
  }
});

app.get('/collections/Categories', async (req, res) => {
  try {
    // Truy vấn tất cả category từ collection Categories
    const categories = await db.collection('Categories').find().toArray();

    // Chuyển đổi _id thành string và gán vào Category_ID
    categories.forEach(category => {
      if (category._id) {
        category.Category_ID = category._id.toString();  // Chuyển ObjectId thành string
      }
    });


    // Trả về danh sách các category
    res.status(200).json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: "Could not fetch the categories" });
  }
});


app.get('/collections/Products', async (req, res) => {
  try {
    // Truy vấn tất cả sản phẩm từ collection Products
    const products = await db.collection('Products').find().toArray();

    // Chuyển đổi _id thành string và gán vào Product_ID
    products.forEach(product => {
      if (product._id) {
        product.Product_ID = product._id.toString();  // Chuyển ObjectId thành string
      }
      if (product.Category_ID && product.Category_ID instanceof ObjectId) {
        product.Category_ID = product.Category_ID.toString();  // Chuyển Category_ID từ ObjectId thành string
      }
    });


    // Trả về danh sách các sản phẩm
    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: "Could not fetch the products" });
  }
});

// ✅ API lấy tài liệu của một collection cụ thể
app.get('/collections/:name', async (req, res) => {
  try {
      const collectionName = req.params.name;

      if (collectionName === 'Orders') {
          const customerId = req.query.Customer_ID;
          let orders;

          if (customerId) {
              console.log(`Fetching orders for Customer_ID: ${customerId}`);
              orders = await db.collection('Orders').find({ Customer_ID: customerId }).toArray();
          } else {
              console.log('Fetching all orders');
              orders = await db.collection('Orders').find().toArray();
          }

          console.log(`Found ${orders.length} orders`);

          // Lấy thông tin chi tiết cho từng đơn hàng
          for (let order of orders) {
              try {
                  // Lấy Order_ID từ collection Payments
                  const payment = await db.collection('Payments').findOne({ Order_ID: order._id.toString() });
                  if (payment) {
                      order.Order_ID = payment.Order_ID;
                  } else {
                      console.warn(`No payment found for Order _id: ${order._id}`);
                      order.Order_ID = 'Unknown';
                  }

                  if (order.Products && Array.isArray(order.Products)) {
                      for (let productItem of order.Products) {
                          try {
                              // Lấy thông tin sản phẩm từ collection Products
                              // Giả sử Product_ID trong Orders là _id của document trong Products
                              const product = await db.collection('Products').findOne({ _id: new ObjectId(productItem.Product_ID) });
                              if (product) {
                                  productItem.Product_Name = product.Product_Name || 'Unknown Product';
                                  productItem.Price = product.Price || 0;
                                  productItem.Product_ID = product._id.toString(); // Chuyển _id thành string
                              } else {
                                  console.warn(`Product not found for Product_ID: ${productItem.Product_ID}`);
                                  productItem.Product_Name = 'Unknown Product';
                                  productItem.Price = 0;
                              }

                              // Lấy hình ảnh đầu tiên từ collection Images
                              const image = await db.collection('Images').findOne(
                                  { Tag: 'Product', ID: productItem.Product_ID },
                                  { sort: { Order: 1 } } // Sắp xếp theo Order tăng dần, lấy hình ảnh đầu tiên
                              );

                              if (image) {
                                  console.log(`Image found for Product_ID: ${productItem.Product_ID}, Order: ${image.Order}`);
                                  productItem.Image_URL = `http://localhost:3000/image/Product/${productItem.Product_ID}/${image.Order}`;
                                  console.log(`Image URL for Product_ID ${productItem.Product_ID}: ${productItem.Image_URL}`);
                              } else {
                                  console.warn(`No image found for Product_ID: ${productItem.Product_ID}`);
                                  productItem.Image_URL = 'https://via.placeholder.com/100';
                              }

                              // Đảm bảo Quantity có giá trị mặc định nếu không tồn tại
                              productItem.Quantity = productItem.Quantity || 1;
                          } catch (error) {
                              console.error(`Error fetching details for Product_ID ${productItem.Product_ID}:`, error);
                              productItem.Product_Name = 'Unknown Product';
                              productItem.Price = 0;
                              productItem.Image_URL = 'https://via.placeholder.com/100';
                              productItem.Quantity = 1;
                          }
                      }
                  } else {
                      console.warn(`Products array missing in order: ${order.Order_ID}`);
                      order.Products = [];
                  }
              } catch (error) {
                  console.error(`Error processing order with _id ${order._id}:`, error);
                  order.Order_ID = 'Unknown';
              }
          }

          console.log('Orders data with product details:', orders);
          res.status(200).json(orders);
      } else {
          const documents = await db.collection(collectionName).find().toArray();
          res.status(200).json(documents);
      }
  } catch (err) {
      console.error('Error fetching collection:', err);
      res.status(500).json({ error: "Could not fetch the collection" });
  }
});


// ✅ API đăng ký
app.post('/register', async (req, res) => {
    try {
        const { phone, email, password } = req.body;
        
        const existingPhone = await db.collection('Customers').findOne({ phone });
        if (existingPhone) return res.status(400).json({ error: "Phone number already exists" });

        const existingUser = await db.collection('Customers').findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const tempToken = jwt.sign({ email, phone, timestamp: Date.now() }, SECRET_KEY, { expiresIn: '10m' });

        res.status(200).json({
            message: "Proceed to info-register",
            tempRegisterData: { phone, email, hashedPassword, token: tempToken }
        });
    } catch (error) {
        res.status(500).json({ error: "Could not process registration" });
    }
});


app.post('/info-register', async (req, res) => {
    try {
        const { name, gender, dob, phone, tempToken, email, hashedPassword } = req.body;

        // Kiểm tra token hợp lệ
        try { 
            jwt.verify(tempToken, SECRET_KEY); 
        } catch (err) {
            return res.status(400).json({ error: "Session expired. Please register again." });
        }

        // Tạo user mới
        const userData = {
            email, 
            password: hashedPassword, 
            name, 
            gender, 
            dob, 
            phone, 
            registeredAt: new Date()
        };
        
        const result = await db.collection('Customers').insertOne(userData);
        if (!result.acknowledged) {
            return res.status(500).json({ error: "Failed to save user data" });
        }

        // Lấy ID của người dùng vừa tạo
        const customerId = result.insertedId.toString();

        // Tạo document mới trong collection Cart
        const cartData = {
            Customer_ID: customerId,
            Cart: []
        };

        const favouriteData = {
            Customer_ID: customerId,
            Favourite: []
        };

        const cartResult = await db.collection('Carts').insertOne(cartData);
        if (!cartResult.acknowledged) {
            return res.status(500).json({ error: "User registered, but failed to create cart." });
        }
        const favouriteResult = await db.collection('Favourites').insertOne(favouriteData);
        if (!favouriteResult.acknowledged) {
            return res.status(500).json({ error: "User registered, but failed to create favourite." });
        }

        res.status(201).json({ message: "User registered successfully and cart created!" });

    } catch (error) {
        res.status(500).json({ error: "Could not complete registration" });
    }
});



// ✅ API đăng nhập (Hỗ trợ email hoặc số điện thoại)
app.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body; // identifier có thể là email hoặc phone

        // Tìm user theo email hoặc số điện thoại
        const user = await db.collection('Customers').findOne({
            $or: [{ email: identifier }, { phone: identifier }]
        });

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        // So sánh password nhập vào với password đã mã hóa trong DB
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: "Invalid password" });
        }

        // Tạo token đăng nhập
        const token = jwt.sign({ userId: user._id, email: user.email }, SECRET_KEY, { expiresIn: '30m' });

        // Trả về thông tin user (bỏ password)
        res.status(200).json({ 
            message: "Login successful", 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                phone: user.phone 
            } 
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Could not log in" });
    }
});



// ✅ Middleware xác thực token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
  
    if (!token) {
      return res.status(401).json({ error: "Access Denied" });
    }
  
    // Lấy token sau "Bearer "
    const tokenWithoutBearer = token.split(' ')[1];
  
    jwt.verify(tokenWithoutBearer, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Invalid Token" });
      }
      req.user = decoded;
      next();
    });
  };


// ✅ API lấy tên khách hàng dựa trên Customer_ID
app.get('/getCustomerName/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;

        // Tìm khách hàng trong cơ sở dữ liệu (chuyển customerId thành ObjectId)
        const customer = await db.collection('Customers').findOne({ _id: new ObjectId(customerId) });

        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }

        // Trả về tên khách hàng, không trả về thông tin nhạy cảm
        res.status(200).json({
            Name: customer.Name
        });
    } catch (error) {
        console.error("Error fetching customer data:", error);
        res.status(500).json({ error: "Could not fetch customer data" });
    }
});


app.get('/collections/Carts', async (req, res) => {
    try {
      const { customerId } = req.query;
      const cartItems = await db.collection('Carts').find({ customerId }).toArray();
      res.status(200).json(cartItems);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin giỏ hàng:', error);
      res.status(500).json({ error: 'Không thể lấy thông tin giỏ hàng' });
    }
  });

  // API để xóa sản phẩm khỏi giỏ hàng của người dùng
app.put('/collections/Carts', async (req, res) => {
    try {
      const { customerId, productId } = req.body;  // Lấy Customer_ID và Product_ID từ body request
  
      // Tìm giỏ hàng của khách hàng
      const cart = await db.collection('Carts').findOne({ Customer_ID: customerId });
  
      if (!cart) {
        return res.status(404).json({ error: 'Giỏ hàng không tìm thấy' });
      }
  
      // Loại bỏ sản phẩm có Product_ID khỏi mảng Cart
      const updatedCart = cart.Cart.filter(item => item.Product_ID !== productId);
  
      // Cập nhật lại giỏ hàng trong cơ sở dữ liệu
      const result = await db.collection('Carts').updateOne(
        { Customer_ID: customerId },
        { $set: { Cart: updatedCart } }
      );
  
      if (result.modifiedCount > 0) {
        res.status(200).json({ message: 'Xóa sản phẩm thành công' });
      } else {
        res.status(400).json({ error: 'Không thể xóa sản phẩm' });
      }
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
      res.status(500).json({ error: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng' });
    }
  });
    

  // API để cập nhật số lượng sản phẩm trong giỏ hàng của người dùng
app.put('/collections/Carts/updateQuantity', async (req, res) => {
    try {
      const { customerId, productId, amount } = req.body; // Lấy Customer_ID, Product_ID, và Amount từ body request
  
      // Tìm giỏ hàng của khách hàng
      const cart = await db.collection('Carts').findOne({ Customer_ID: customerId });
  
      if (!cart) {
        return res.status(404).json({ error: 'Giỏ hàng không tìm thấy' });
      }
  
      // Tìm sản phẩm trong mảng Cart và cập nhật số lượng
      const updatedCart = cart.Cart.map(item => {
        if (item.Product_ID === productId) {
          item.Amount = amount; // Cập nhật số lượng sản phẩm
        }
        return item;
      });
  
      // Cập nhật lại giỏ hàng trong cơ sở dữ liệu
      const result = await db.collection('Carts').updateOne(
        { Customer_ID: customerId },
        { $set: { Cart: updatedCart } }
      );
  
      if (result.modifiedCount > 0) {
        res.status(200).json({ message: 'Cập nhật số lượng sản phẩm thành công' });
      } else {
        res.status(400).json({ error: 'Không thể cập nhật số lượng sản phẩm' });
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật số lượng sản phẩm:', error);
      res.status(500).json({ error: 'Lỗi khi cập nhật số lượng sản phẩm' });
    }
  });
  
  
// API thêm sản phẩm vào giỏ hàng
app.post('/add-to-cart', authenticateToken, async (req, res) => {
    try {
        const { productId } = req.body;  // Product_ID được truyền từ body
        const customerId = req.user.userId;  // Lấy Customer_ID từ token đã giải mã

        // Tìm giỏ hàng của khách hàng
        const cart = await db.collection('Carts').findOne({ Customer_ID: customerId });

        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const existingItem = cart.Cart.find(item => item.Product_ID === productId);

        if (existingItem) {
            // Nếu sản phẩm đã có trong giỏ hàng, tăng số lượng lên 1
            existingItem.Amount += 1;

            // Cập nhật lại giỏ hàng trong cơ sở dữ liệu
            await db.collection('Carts').updateOne(
                { Customer_ID: customerId },
                { $set: { Cart: cart.Cart } }
            );
            return res.status(200).json({ message: 'Sản phẩm đã được thêm vào giỏ hàng (cập nhật số lượng).' });
        } else {
            // Nếu sản phẩm chưa có trong giỏ hàng, thêm sản phẩm vào giỏ hàng
            cart.Cart.push({ Product_ID: productId, Amount: 1 });

            // Cập nhật lại giỏ hàng trong cơ sở dữ liệu
            await db.collection('Carts').updateOne(
                { Customer_ID: customerId },
                { $set: { Cart: cart.Cart } }
            );
            return res.status(200).json({ message: 'Sản phẩm đã được thêm vào giỏ hàng.' });
        }
    } catch (error) {
        console.error("Error adding product to cart:", error);
        res.status(500).json({ error: "Có lỗi khi thêm sản phẩm vào giỏ hàng" });
    }
});


// ✅ Thêm route để lưu đánh giá vào collection Reviews
app.post('/collections/Reviews', authenticateToken, async (req, res) => {
    try {
        const { Product_ID, Order_ID, Rating, Comment, Customer_ID } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!Product_ID || !Order_ID || !Rating || !Customer_ID) {
            return res.status(400).json({ error: 'Product_ID, Order_ID, Rating, and Customer_ID are required' });
        }

        // Tạo ngày hiện tại theo định dạng DD/MM/YYYY
        const today = new Date();
        const date = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

        // Tạo document mới cho Reviews
        const newReview = {
            Product_ID, // Để nguyên, sẽ chuyển đổi thành ObjectId khi truy vấn
            Order_ID,
            Rating,
            Comment: Comment || '', // Nếu không có Comment, để rỗng
            Date: date,
            Customer_ID
        };

        // Lưu đánh giá vào collection Reviews
        const result = await db.collection('Reviews').insertOne(newReview);
        
        // Chuyển Product_ID thành ObjectId để truy vấn trong collection Products
        const productObjectId = new ObjectId(Product_ID);

        // Tính toán lại Rating trung bình cho sản phẩm (Product_ID)
        const reviews = await db.collection("Reviews").find({ Product_ID: Product_ID }).toArray();
        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.Rating, 0) / reviews.length
            : 0;  // Nếu không có đánh giá, Rating trung bình sẽ là 0

        // Cập nhật lại Rating trung bình vào collection Products
        await db.collection("Products").updateOne(
            { _id: productObjectId }, // Truy vấn sản phẩm theo ObjectId
            { $set: { Rating: averageRating } } // Cập nhật Rating mới
        );

        // Trả về thông tin đánh giá đã được thêm
        res.status(201).json({ ...newReview, _id: result.insertedId });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ error: 'Could not add review' });
    }
});


// ✅ Thêm route để lưu đơn hàng vào collection Orders (sau khi thanh toán)
app.post('/collections/Orders', authenticateToken, async (req, res) => {
    try {
        const { Customer_ID, Product_ID, Quantity, Payment_Method, Address } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!Customer_ID || !Product_ID || !Quantity || !Payment_Method || !Address) {
            return res.status(400).json({ error: 'Customer_ID, Product_ID, Quantity, Payment_Method, and Address are required' });
        }

        // Tạo Order_ID (có thể dùng timestamp hoặc một logic khác để tạo ID duy nhất)
        const timestamp = Date.now();
        const orderId = `ORDER_${timestamp}`;

        // Tạo ngày đặt hàng theo định dạng DD/MM/YYYY
        const today = new Date();
        const orderDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

        // Lấy thông tin sản phẩm từ collection Products
        const product = await db.collection('Products').findOne({ Product_ID: Product_ID });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Tạo document mới cho Orders
        const newOrder = {
            Order_ID: orderId,
            Customer_ID,
            Product_ID,
            Product_Name: product.Product_Name || 'Unknown Product',
            Image_URL: product.Image_URL || 'https://via.placeholder.com/100',
            Quantity: parseInt(Quantity),
            Price: product.Price || 0,
            Order_Date: orderDate,
            Payment_Method,
            Address,
            DeliveryStatus: 'Đặt hàng thành công',
            Status: 'CHỜ XÁC NHẬN'
        };

        const result = await db.collection('Orders').insertOne(newOrder);
        res.status(201).json({ ...newOrder, _id: result.insertedId });
    } catch (error) {
        console.error('Error adding order:', error);
        res.status(500).json({ error: 'Could not add order' });
    }
});

mongoose.connect('mongodb://localhost:27017/legoTalk')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Tạo schema cho hình ảnh trong collection Images
const imageSchema = new mongoose.Schema({
  Tag: String,
  ID: String,
  Order: String,
  ImageData: String, // <-- Đã chuyển từ Buffer thành String Base64
  MIMEType: String
}, { collection: 'Images' });

const Image = mongoose.model('Image', imageSchema);

// API để trả về hình ảnh từ collection Images
app.get('/image/:tag/:id/:order', async (req, res) => {
  const { tag, id, order } = req.params;

  try {
    const image = await Image.findOne({ Tag: tag, ID: id, Order: order });

    if (!image) {
      return res.status(404).send('Image not found');
    }

    // Lấy MIME type từ Base64 prefix nếu cần
    let base64Data = image.ImageData;

    if (base64Data.startsWith('data:')) {
      // Extract MIME type từ prefix
      const mimeMatch = base64Data.match(/^data:(.*);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : image.MIMEType || 'image/jpeg';

      // Loại bỏ prefix để lấy phần base64 thuần
      base64Data = base64Data.replace(/^data:.*;base64,/, '');

      // Convert base64 về buffer
      const imgBuffer = Buffer.from(base64Data, 'base64');

      // Set header & gửi về client
      res.setHeader('Content-Type', mimeType);
      res.send(imgBuffer);
    } else {
      // Nếu format không đúng, fallback
      res.status(500).send('Invalid image data format');
    }
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/toggle-favourite', authenticateToken, async (req, res) => {
    try {
        const { productId } = req.body;  // Lấy Product_ID từ body request
        const customerId = req.user.userId;  // Lấy Customer_ID từ token đã giải mã

        // Tìm tài liệu yêu thích của khách hàng
        const favourite = await db.collection('Favourites').findOne({ Customer_ID: customerId });

        if (!favourite) {
            return res.status(404).json({ error: 'Không tìm thấy danh sách yêu thích của khách hàng.' });
        }

        // Kiểm tra xem sản phẩm đã có trong danh sách yêu thích chưa
        const existingItemIndex = favourite.Favourite.findIndex(item => item.Product_ID === productId);

        if (existingItemIndex > -1) {
            // Nếu sản phẩm đã có trong danh sách yêu thích, xoá nó
            favourite.Favourite.splice(existingItemIndex, 1);

            // Cập nhật lại danh sách yêu thích trong cơ sở dữ liệu
            await db.collection('Favourites').updateOne(
                { Customer_ID: customerId },
                { $set: { Favourite: favourite.Favourite } }
            );
            return res.status(200).json({ message: 'Sản phẩm đã được xoá khỏi danh sách yêu thích.' });
        } else {
            // Nếu sản phẩm chưa có trong danh sách yêu thích, thêm nó vào
            favourite.Favourite.push({ Product_ID: productId });

            // Cập nhật lại danh sách yêu thích trong cơ sở dữ liệu
            await db.collection('Favourites').updateOne(
                { Customer_ID: customerId },
                { $set: { Favourite: favourite.Favourite } }
            );
            return res.status(200).json({ message: 'Sản phẩm đã được thêm vào danh sách yêu thích.' });
        }
    } catch (error) {
        console.error("Error toggling favourite product:", error);
        res.status(500).json({ error: "Có lỗi khi thêm hoặc xoá sản phẩm khỏi danh sách yêu thích" });
    }
});

app.post('/checkout', authenticateToken, async (req, res) => {
    try {
      const { customerId, paymentMethod, address, phone, name, discountCodeOut, totalAmount, cartItems } = req.body;
  
      // Kiểm tra nếu phương thức thanh toán là COD
      if (paymentMethod !== 'COD') {
        return res.status(400).json({ error: "Chỉ hỗ trợ thanh toán COD." });
      }
  
      // Lấy ngày hiện tại để tạo Order_Date
      const today = new Date();
      const orderDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
  
      // Tạo Order_ID (có thể sử dụng timestamp hoặc một cách khác để tạo ID duy nhất)
      const orderId = `ORDER_${Date.now()}`;
      
      // Tạo mảng Products (chỉ lưu Product_ID, Quantity, Status)
      const productsForOrder = cartItems
        .filter(item => item.Amount > 0)
        .map(item => ({
            Product_ID: item.Product_ID,
            Quantity: item.Amount,
            
        }));

      // Kiểm tra nếu không có sản phẩm nào hợp lệ
      if (productsForOrder.length === 0) {
          return res.status(400).json({ error: "Không có sản phẩm hợp lệ để đặt hàng." });
      }

      // Tạo document cho Order, thêm Status: "Chờ xác nhận"
      const orderData = {
        Order_ID: orderId,
        Customer_ID: customerId,
        Order_Date: orderDate,
        Discount_Code: discountCodeOut || "Không có mã giảm giá",
        Amount: totalAmount,
        Products: cartItems.filter(item => item.Amount > 0).map(item => ({
          Product_ID: item.Product_ID,
          Quantity: item.Amount
        })),
        Status: "Chờ xác nhận"  // Thêm Status vào đây
      };
      
      console.log('Order data to be inserted:', orderData);

      // Thêm Order vào collection Orders
      const orderResult = await db.collection('Orders').insertOne(orderData);
      if (!orderResult.acknowledged) {
        return res.status(500).json({ error: "Không thể tạo đơn hàng." });
      }
  
      const orderIdString = orderResult.insertedId.toString();
  
      // Tạo thông tin giao hàng vào collection Deliveries
      const deliveryData = {
        Order_ID: orderIdString,
        Phone: phone,
        Name: name,
        Delivery_Address: [
          address.Province,
          address.District,
          address.Ward,
          address.Street
        ]
      };
  
      const deliveryResult = await db.collection('Deliveries').insertOne(deliveryData);
      if (!deliveryResult.acknowledged) {
        return res.status(500).json({ error: "Không thể tạo thông tin giao hàng." });
      }
  
      // Tạo thông tin thanh toán vào collection Payments
      const paymentData = {
        Order_ID: orderIdString,
        Payment_Method: "COD",
        Amount: totalAmount,
        Products: cartItems.filter(item => item.Amount > 0).map(item => ({
            Product_ID: item.Product_ID,
            Quantity: item.Amount,
            
        }))
      };
  
      const paymentResult = await db.collection('Payments').insertOne(paymentData);
      if (!paymentResult.acknowledged) {
        return res.status(500).json({ error: "Không thể tạo thông tin thanh toán." });
      }
  
      // Bây giờ xóa các sản phẩm đã thanh toán khỏi giỏ hàng
      const productIdsToDelete = cartItems.filter(item => item.Amount > 0).map(item => item.Product_ID);
  
      const cartUpdateResult = await db.collection('Carts').updateOne(
        { Customer_ID: customerId },
        { $pull: { Cart: { Product_ID: { $in: productIdsToDelete } } } }
      );
  
      if (!cartUpdateResult.modifiedCount) {
        console.log('Không có sản phẩm nào được xóa khỏi giỏ hàng.');
      }
  
      // Trả về thông báo thành công
      res.status(200).json({ message: "Đặt hàng thành công. Quay lại trang chủ!", orderId: orderIdString });
  
    } catch (error) {
      console.error('Error processing order:', error);
      res.status(500).json({ error: "Có lỗi xảy ra khi đặt hàng." });
    }
  });

// API lấy thông tin người dùng theo customerId từ token
app.get('/getUserInfo', authenticateToken, async (req, res) => {
    try {
      const customerId = req.user.userId; // Lấy customerId từ token
  
      // Tìm thông tin người dùng trong collection Customers
      const user = await db.collection('Customers').findOne({ _id: new ObjectId(customerId) });
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Trả về thông tin người dùng (bỏ mật khẩu)
      const { password, ...userInfo } = user;
      res.status(200).json(userInfo);
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ error: "Could not fetch user data" });
    }
  });

  
  // API cập nhật thông tin người dùng
app.put('/updateUserInfo', authenticateToken, async (req, res) => {
    const { name, gender, dob, email, phone } = req.body;
    const customerId = req.user.userId; // Lấy customerId từ token
  
    try {
      const result = await db.collection('Customers').updateOne(
        { _id: new ObjectId(customerId) },
        { $set: { name, gender, dob, email, phone } }
      );
  
      if (result.modifiedCount > 0) {
        res.status(200).json({ message: 'Thông tin người dùng đã được cập nhật thành công' });
      } else {
        res.status(404).json({ error: 'Không tìm thấy người dùng để cập nhật' });
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      res.status(500).json({ error: 'Không thể cập nhật thông tin người dùng' });
    }
  });
  