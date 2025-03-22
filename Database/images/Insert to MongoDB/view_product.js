const express = require('express');
const mongoose = require('mongoose');
const { Binary } = require('mongodb');
const app = express();
const port = 3000;

// Kết nối tới MongoDB
mongoose.connect('mongodb://localhost:27017/legoTalk')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Tạo schema cho hình ảnh trong collection Images
const imageSchema = new mongoose.Schema({
  Tag: String,
  ID: String,
  Order: String,
  ImageData: Buffer, // Lưu trữ hình ảnh dạng binary
  MIMEType: String
}, { collection: 'Images' }); // Đảm bảo truy vấn từ collection 'Images'

const Image = mongoose.model('Image', imageSchema);

// API để trả về hình ảnh từ collection Images
app.get('/image/:tag/:id/:order', async (req, res) => {
  const { tag, id, order } = req.params;

  try {
    const image = await Image.findOne({ Tag: tag, ID: id, Order: order });

    if (!image) {
      return res.status(404).send('Image not found');
    }

    // Cài đặt loại MIME cho hình ảnh
    res.setHeader('Content-Type', image.MIMEType);
    
    // Trả về hình ảnh dưới dạng binary
    res.send(image.ImageData);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Bắt đầu server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
