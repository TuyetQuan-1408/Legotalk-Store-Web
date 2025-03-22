const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const mongoURI = "mongodb://localhost:27017";
const dbName = "legoTalk";
const collectionName = "Images";

async function uploadImages() {
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const baseDir = "D://VSCode//legoTalk//Post//Posts//Post";  // Đường dẫn đến thư mục chứa ảnh

    // Lấy danh sách thư mục (Tag)
    const tagFolders = fs.readdirSync(baseDir).filter(f => fs.lstatSync(path.join(baseDir, f)).isDirectory());

    for (const tag of tagFolders) {
        const tagPath = path.join(baseDir, tag);

        // Lấy danh sách thư mục con bậc 2 (Product_ID)
        const productFolders = fs.readdirSync(tagPath).filter(f => fs.lstatSync(path.join(tagPath, f)).isDirectory());

        for (const productID of productFolders) {
            const productPath = path.join(tagPath, productID);

            // Lấy danh sách ảnh trong thư mục con bậc 2
            const images = fs.readdirSync(productPath).filter(f => ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'].includes(path.extname(f).toLowerCase()));

            for (const imageName of images) {
                const imagePath = path.join(productPath, imageName);
                const imageBuffer = fs.readFileSync(imagePath);  // Đọc ảnh dưới dạng Buffer

                // Chuyển đổi Buffer thành chuỗi base64
                const base64Image = imageBuffer.toString('base64');

                // Đặt MIMEType
                const originalMimeType = path.extname(imageName).substring(1);  // Lấy phần mở rộng của ảnh
                const mimeType = `image/${originalMimeType}`;  // Định dạng MIMEType

                // Đặt Order là tên ảnh (trong trường hợp này Order có thể là tên ảnh)
                const order = path.basename(imageName, path.extname(imageName));  // Lấy phần tên ảnh mà không có phần mở rộng

                // Lưu vào MongoDB với cấu trúc yêu cầu
                await collection.insertOne({
                    Tag: tag,            // Lưu Tag (thư mục con bậc 1)
                    ID: productID,       // Lưu Product_ID (thư mục con bậc 2)
                    Order: order,        // Lưu Order (tên ảnh)
                    ImageData: `data:${mimeType};base64,${base64Image}`,  // Lưu ảnh dưới dạng chuỗi base64
                    MIMEType: mimeType,   // Lưu MIMEType của ảnh (image/jpg, image/png, ...)
                });

                console.log(`✅ Đã lưu ảnh ${imageName} của sản phẩm ${productID} thuộc Tag ${tag}`);
            }
        }
    }

    console.log("🎉 Hoàn tất nhập ảnh vào MongoDB!");
    client.close();
}

uploadImages();
