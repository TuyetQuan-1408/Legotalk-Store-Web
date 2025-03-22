const { MongoClient } = require('mongodb');

// MongoDB connection URI
const uri = 'mongodb://localhost:27017'; // <-- Thay đổi nếu cần
const dbName = 'legoTalk'; // <-- Tên DB
const client = new MongoClient(uri);

async function convertImages() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('Images'); // <-- Tên collection

    // Tìm tất cả document
    const cursor = collection.find();

    while (await cursor.hasNext()) {
      const doc = await cursor.next();

      // Kiểm tra nếu có ImageData dạng Binary
      if (doc.ImageData && doc.ImageData.buffer) {
        // Chuyển Binary sang Base64
        const base64String = doc.ImageData.buffer.toString('base64');

        // Lấy MIMEType gốc, mặc định jpg nếu không có
        let originalMimeType = (doc.MIMEType || "jpeg").toLowerCase();
        // (Optional) làm sạch MIMEType nếu cần
        originalMimeType = originalMimeType.replace(/[^a-z0-9]/g, "");

        // Format thành data:image/{type};base64,...
        const mimeType = `image/${originalMimeType}`;
        const newImageData = `data:${mimeType};base64,${base64String}`;

        // Update lại document
        await collection.updateOne(
          { _id: doc._id },
          {
            $set: {
              ImageData: newImageData,
              MIMEType: mimeType
            }
          }
        );

        console.log(`Updated document _id: ${doc._id}`);
      }
    }

    console.log('✅ All documents updated successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

convertImages();
