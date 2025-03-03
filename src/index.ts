// src/index.ts
import express, { Request, Response, Router } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import User from "./user";
// import upload from "./upload";
import { Uploadfile } from "./upload";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import category from "./danhmuc";
import Cart, { ICartItem } from "./cart";
import product from "./product";
import Order from "./order";
import Product from "./product";
import ChangePassword from "./ChangePassword";
import { Socket } from "socket.io";
import DeactivationHistory from "./DeactivationHistory";
import Customer from "./customerSchema";

const http = require("http");
const socketIo = require("socket.io");
var cors = require("cors");
const fs = require("fs");
require("dotenv").config();
//nodemailer
const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");
const app = express();
//socketIo
const server = http.createServer(app);
const io = socketIo(server);
const { uploadPhoto } = require("./middleware/uploadImage.js");
const PORT = process.env.PORT || 28017;
const {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
} = require("./utils/Cloudinary");
const JWT_SECRET = process.env.JWT_SECRET as string;
const router = Router();
mongoose
  .connect(
    "mongodb+srv://ungductrungtrung:Jerry2912@cluster0.4or3syc.mongodb.net/",
    {
      //   useNewUrlParser: true,
      //   useUnifiedTopology: true,
    }
  )
  .then(() => console.log("DB connection successful"))
  .catch((err) => console.log(err));

app.use(cors());
app.use(bodyParser.json());

// Định nghĩa kiểu cho userSockets
interface UserSockets {
  [userId: string]: string; // userId  tới socket.id
}

const userSockets: UserSockets = {};

io.on("connection", (socket: Socket) => {
  console.log("A user connected:", socket.id);

  // Lắng nghe sự kiện đăng nhập của người dùng
  socket.on("userLogin", (userId: string) => {
    userSockets[userId] = socket.id;
    console.log("User logged in:", userId);
  });

  // Lắng nghe sự kiện ngắt kết nối
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Xóa socket khỏi danh sách khi người dùng ngắt kết nối
    for (const userId in userSockets) {
      if (userSockets[userId] === socket.id) {
        console.log(userSockets[userId])
        delete userSockets[userId];
        break;
      }
    }
  });
});

app.post(
  "/upload",
  uploadPhoto.array("images", 10),
  async (req: any, res: any) => {
    console.log("Files received in backend:", req.files);
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    try {
      const uploader = (path: any) => cloudinaryUploadImg(path);
      const urls = [];
      for (const file of req.files) {
        const { path } = file;
        const newpath = await uploader(path);
        urls.push(newpath);
        fs.unlinkSync(path); // Remove file after upload
      }

      res.status(201).json({
        payload: urls,
        status: 200,
      });
    } catch (error: any) {
      console.error("Upload error:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
);
app.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi lấy thông tin người dùng!",
    });
  }
});

app.get("/user/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId); // Fetch user by ID

    if (!user) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    res.json(user); // Respond with the user's data
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      message: "Error fetching user information!",
    });
  }
});
app.get("/usersaccount", async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi lấy thông tin người dùng!",
    });
  }
});

app.put("/user/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi cập nhật thông tin người dùng",
    });
  }
});

app.put("/admin/user/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi cập nhật thông tin người dùng",
    });
  }
});


// Login
app.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    if (!user.active) {
      return res.status(403).json({
        message: "Account is disabled. Please contact support.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password!" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: process.env.EXPIRES_TOKEN,
    });

    if (user.role === "admin") {
      res.json({
        message: "Welcome Admin!",
        id: user._id,
        info: {
          email: user.email,
          role: user.role,
          name: user.name,
        },
        token: token,
        expiresIn: process.env.EXPIRES_TOKEN,
      });
    } else if (user.role === "shipper") {
      res.json({
        message: "Welcome Shipper!",
        id: user._id,
        info: {
          email: user.email,
          role: user.role,
          name: user.name,
        },
        token: token,
        expiresIn: process.env.EXPIRES_TOKEN,
      });
    } else {
      res.json({
        message: "Welcome User!",
        id: user._id,
        info: {
          email: user.email,
          role: user.role,
          name: user.name,
        },
        token: token,
        expiresIn: process.env.EXPIRES_TOKEN,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in!" });
  }
});

app.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({
      message: "Thêm người dùng thành công",
      user: newUser,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi tạo người dùng mới" });
  }
});

// Thêm sản phẩm
app.post("/product/add", async (req: Request, res: Response) => {
  try {
    const { masp, name, price, img, moTa, categoryID, status} =
      req.body;

    // Kiểm tra xem có sản phẩm nào có cùng masp hoặc name không
    const existingProductByMasp = await Product.findOne({ masp });
    const existingProductByName = await Product.findOne({ name });

    const Category = await category.findById(categoryID);
    if (existingProductByMasp) {
      return res.status(400).json({ message: "Mã sản phẩm đã tồn tại" });
    }

    if (existingProductByName) {
      return res.status(400).json({ message: "Tên sản phẩm đã tồn tại" });
    }

    if (!Category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
   

    const newProduct = new Product({
      masp,
      name,
      price,
      img,
      moTa,
      category: categoryID,
      status
    });

    await newProduct.save();
    res.status(201).json({
      message: "Thêm sản phẩm thành công",
      product: newProduct,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi thêm mới" });
  }
});

// Lấy tất cả sản phẩm
app.get("/products", async (req: Request, res: Response) => {
  try {
    const products = await Product.find().populate("category material");
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi lấy danh sách sản phẩm" });
  }
});

app.get("/product-test", async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, admin } = req.query;

    const options = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      populate: [
        { path: "category", select: "name" }
      ],
    };

    const filter = admin === "true" ? { status: true } : {};

    const products = await product.paginate(filter, options);

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      message: "Error retrieving product information",
    });
  }
});
// Lấy một sản phẩm theo ID
app.get("/product/:id", async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category material"
    );
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi lấy sản phẩm" });
  }
});

// Update a product by ID
app.put("/product/:id", async (req: Request, res: Response) => {
  try {
    const { masp, name, img, moTa, categoryID, status } =
      req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        masp,
        name,
        img,
        moTa,
        category: categoryID,
        status,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res
      .status(200)
      .json({
        message: "Cập nhật sản phẩm thành công",
        product: updatedProduct,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi cập nhật sản phẩm" });
  }
});

app.put("/updatecategory/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateCategory = await category.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateCategory);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi khi cập nhật Danh mục" });
  }
});

app.delete("/product/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const test = await product.findByIdAndDelete(id);

    res.json({
      message: "Sản phẩm đã được xóa thành công",
      id: id,
      test: test,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "lỗi khi xóa sản phẩm" });
  }
});

// active product
app.put("/product/deactivate/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productToUpdate = await product.findByIdAndUpdate(
      id,
      { status: false },
      { new: true }
    );

    if (!productToUpdate) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm để vô hiệu hóa" });
    }

    res.json({
      message: "Sản phẩm đã được vô hiệu hóa",
      product: productToUpdate,
    });
  } catch (error) {
    console.error("Error deactivating product:", error);
    res.status(500).json({ message: "Lỗi khi vô hiệu hóa sản phẩm" });
  }
});

// deactive product
app.put("/product/activate/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productToUpdate = await product.findByIdAndUpdate(
      id,
      { status: true },
      { new: true }
    );

    if (!productToUpdate) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm để kích hoạt lại" });
    }

    res.json({
      message: "Sản phẩm đã được kích hoạt lại",
      product: productToUpdate,
    });
  } catch (error) {
    console.error("Error activating product:", error);
    res.status(500).json({ message: "Lỗi khi kích hoạt lại sản phẩm" });
  }
});

//  Categoty : Get
app.get("/category", async (req: Request, res: Response) => {
  try {
    const categories = await category.find();
    res.json(categories);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi khi lấy thông tin danh mục" });
  }
});
app.get("/category/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const Category = await category.findById(id);
    res.json(Category);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi khi lấy thông tin danh mục" });
  }
});

//  Categoty : Post
app.post("/addcategory", async (req: Request, res: Response) => {
  try {
    const newCategory = new category(req.body);
    await newCategory.save();
    res.status(201).json({
      massege: "Thêm Category thành công",
      category: newCategory,
      status: 200,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi thêm mới danh mục" });
  }
});

//  Categoty : Delete
app.delete("/category/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const del = await category.findByIdAndDelete(id);
    res.json({
      message: "Danh mục đã xoá thành công",
      id: id,
      test: del,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi khi xóa danh mục" });
  }
});

app.delete("/product/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const del = await product.findByIdAndDelete(id);
    res.json({
      message: "Sp đã xoá thành công",
      id: id,
      test: del,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi khi xóa SP" });
  }
});

// gui mail
async function sendDeactivationEmail(userEmail: string, reason: string) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: 'Beautiful House Admin',
    to: userEmail,
    subject: 'Tài khoản của bạn đã bị vô hiệu hóa',
    text: `Chào bạn,

Tài khoản của bạn đã bị vô hiệu hóa vì lý do: ${reason}.
Nếu bạn có thắc mắc, vui lòng liên hệ với chúng tôi qua Email : tuyenteo896@gmail.com để khôi phục Email.

Trân trọng,
`,
  };

  await transporter.sendMail(mailOptions);
}

// Vô hiệu hóa User
app.put("/user/deactivate/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Lý do vô hiệu hóa là bắt buộc" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { active: false, reason },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Gửi email thông báo
    try {
      await sendDeactivationEmail(user.email, reason);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Không trả về lỗi 500 nếu gửi email không thành công, nhưng có thể log lại
    }

    // Notify via WebSocket
    const socketId = userSockets[user._id];
    if (socketId) {
      io.to(socketId).emit("kicked", { message: "Tài khoản của bạn đã bị vô hiệu hóa." });
      delete userSockets[user._id];
    }

    // Send response to frontend to clear session storage
    res.json({
      message: "Người dùng đã được vô hiệu hóa, vui lòng đăng nhập lại.",
      logout: true // Thêm cờ để chỉ ra rằng người dùng nên đăng xuất
    });
  } catch (error) {
    console.error("Error deactivating user:", error);
    res.status(500).json({ message: "Lỗi khi vô hiệu hóa người dùng" });
  }
});

app.get("/user/deactivation-history", async (req: Request, res: Response) => {
  try {
    const history = await DeactivationHistory.find().populate("userId deactivatedBy", "name email").exec();
    res.json(history);
  } catch (error) {
    console.error("Error fetching deactivation history:", error);
    res.status(500).json({ message: "Lỗi khi lấy lịch sử vô hiệu hóa" });
  }
});
// Kích hoạt lại người dùng
app.put("/user/activate/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ." });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { active: true, reason: null }, // Xóa lý do khi kích hoạt
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy người dùng để kích hoạt lại." });
    }

    res.json({ message: "Người dùng đã được kích hoạt lại", user });
  } catch (error) {
    console.error("Error activating user:", error);
    res.status(500).json({ message: "Lỗi khi kích hoạt lại người dùng." });
  }
});

// Thêm danh mục
app.post("/addcategory", async (req: Request, res: Response) => {
  try {
    const newCategory = new category({ ...req.body, status: "active" });
    await newCategory.save();
    res.status(201).json({
      message: "Thêm Category thành công",
      category: newCategory,
      status: 200,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi thêm mới danh mục" });
  }
});

// Vô hiệu hóa danh mục
app.put("/category/deactivate/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Deactivate the category
    const categoryToUpdate = await category.findByIdAndUpdate(
      id,
      { status: "deactive" },
      { new: true }
    );

    if (!categoryToUpdate) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy danh mục để vô hiệu hóa" });
    }

    // Deactivate all products in the category
    const updatedProducts = await product.updateMany(
      { category: id }, // Tìm tất cả sản phẩm có category trùng với id danh mục
      { status: false } // Đặt trạng thái của sản phẩm thành 'false'
    );

    res.json({
      message: "Danh mục và các sản phẩm liên quan đã được vô hiệu hóa",
      category: categoryToUpdate,
    });
  } catch (error) {
    console.error("Error deactivating category:", error);
    res.status(500).json({ message: "Lỗi khi vô hiệu hóa danh mục" });
  }
});

// Kích hoạt lại danh mục
app.put("/category/activate/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Activate the category
    const categoryToUpdate = await category.findByIdAndUpdate(
      id,
      { status: "active" },
      { new: true }
    );

    if (!categoryToUpdate) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy danh mục để kích hoạt lại" });
    }

    // Activate all products in the category
    const updatedProducts = await product.updateMany(
      { category: id }, // Tìm tất cả sản phẩm có category trùng với id danh mục
      { status: true } // Đặt trạng thái của sản phẩm thành 'true'
    );

    res.json({
      message: "Danh mục và các sản phẩm liên quan đã được kích hoạt lại",
      category: categoryToUpdate,
    });
  } catch (error) {
    console.error("Error activating category:", error);
    res.status(500).json({ message: "Lỗi khi kích hoạt lại danh mục" });
  }
});

// Lấy danh mục
app.get("/category", async (req: Request, res: Response) => {
  try {
    const categories = await category.find({ status: "active" }); // Chỉ lấy danh mục hoạt động
    res.json(categories);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi khi lấy thông tin danh mục" });
  }
});

app.get("/deactive/:id", (req, res) => {
  const itemId = req.params.id;
  // Gọi hàm để deactive item với id là itemId
  res.send(`Deactivating item with ID ${itemId}`);
});

// Materal



app.put("/product/deactivate/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productToUpdate = await product.findByIdAndUpdate(
      id,
      { status: false },
      { new: true }
    );

    if (!productToUpdate) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm để vô hiệu hóa" });
    }

    res.json({
      message: "Sản phẩm đã được vô hiệu hóa",
      product: productToUpdate,
    });
  } catch (error) {
    console.error("Error deactivating product:", error);
    res.status(500).json({ message: "Lỗi khi vô hiệu hóa sản phẩm" });
  }
});

app.put("/product/activate/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productToUpdate = await product.findByIdAndUpdate(
      id,
      { status: true },
      { new: true }
    );

    if (!productToUpdate) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm để kích hoạt lại" });
    }

    res.json({
      message: "Sản phẩm đã được kích hoạt lại",
      product: productToUpdate,
    });
  } catch (error) {
    console.error("Error activating product:", error);
    res.status(500).json({ message: "Lỗi khi kích hoạt lại sản phẩm" });
  }
});




app.post("/order/confirm", async (req: Request, res: Response) => {
  // tien mat
  const { userId, items, amount, paymentMethod, customerDetails } = req.body;

  try {
    if (!userId || !items || !amount || !paymentMethod || !customerDetails) {
      return res.status(400).json({ message: "Missing order data" });
    }

    // Create a new order document
    const order = new Order({
      userId: userId,
      items,
      amount,
      paymentMethod,
      status: "pending",
      createdAt: new Date(),
      customerDetails,
    });

    await order.save();
    await Cart.findOneAndUpdate({ userId }, { items: [] });

    // Chuẩn bị thông tin sản phẩm cho email
    const productDetailsHtml = items.map((item: ICartItem) => {
      const variantInfo = `
        <p>Kích thước: ${item.size}</p>
        <p>Giá: ${(item.price).toFixed(0)} VND</p>
        
      ` ;

      return `
        <div style="margin-bottom: 10px;">
          <h3>Tên sản phẩm: ${item.name}.</h3>
          <p>Giá sản phẩm: ${(item.price).toFixed(0)} VND.</p>
          <p>Số lượng: ${item.quantity}.</p>

          <p>Biến thể sản phẩm: ${variantInfo}.</p>
           <p>Hình ảnh sản phẩm :</p>
          <img src="${item.img[0]}" alt="${item.name}" style="width:200px; height:auto;" />
        </div>
      `;
    }).join('');
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Gửi email xác nhận
    const emailOptions = {
      from: process.env.EMAIL_USER,
      to: customerDetails.email,
      subject: ' Beautiful House - Xác nhận đơn hàng',
      html: `
        <h1>Xác nhận đơn hàng</h1>
        <p>Đơn hàng của bạn đã được đặt thành công!</p>
        <p>ID đơn hàng: ${order._id}.</p>
        <p>Họ và tên Khách Hàng: ${customerDetails.name}.</p>
        <p>Email Khách Hàng: ${customerDetails.email}.</p>
        <p>Số điện thoại Khách Hàng: ${customerDetails.phone}.</p>
        <p>Địa chỉ Khách Hàng: ${customerDetails.address}.</p>
        <h2>Thông tin sản phẩm :</h2>
        ${productDetailsHtml}
        <p>Thời gian đặt đơn hàng: ${order.createdAt}.</p>
        <h4>Phương thức thanh toán: Thanh toán khi nhận hàng </h4>
        <h4>Thời gian nhận hàng : 2 - 3 ngày tới.</h4>
      `,
    };

    await transporter.sendMail(emailOptions);

    res.status(201).json({
      message: "Order confirmed and cart reset",
      orderId: order._id,
    });
  } catch (error) {
    console.error("Order confirmation error:", error);
    res.status(500).json({ message: "Order confirmation failed", error });
  }
});

app.post("/registerwifi", async (req: Request, res: Response) => {
  
  try {
    const { name, phone, email, address, notes } = req.body;

    if (!name || !address) {
      return res.status(400).json({ message: "Tên và địa chỉ là bắt buộc" });
    }

    const newCustomer = new Customer({ name, phone, email, address, notes });

    await newCustomer.save();
    res.status(201).json({ message: "Đăng ký thành công", customer: newCustomer });
  } catch (error) {
    console.error("❌ Lỗi khi đăng ký khách hàng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

app.get("/customers", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 }); // Sắp xếp mới nhất -> cũ nhất
    res.status(200).json(customers);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách khách hàng:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách khách hàng" });
  }
});


app.put("/change-password/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { oldPassword, newPassword, changedBy } = req.body;

  try {
    // Kiểm tra ID người dùng
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Tìm người dùng
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Mã hóa mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Cập nhật mật khẩu trong tài liệu người dùng
    user.password = hashedNewPassword;
    await user.save();


    // Ghi lại lịch sử thay đổi mật khẩu
    const changeLog = new ChangePassword({
      userId,
      oldPassword, // Có thể không lưu mật khẩu cũ để bảo mật
      newPassword: hashedNewPassword,
      changedBy,
    });
    await changeLog.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.put("/updateProfile/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { name, dob, gender, address, phone, img } = req.body;

  try {
    // Validate required fields (optional based on your needs)
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Update the user in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...(img && { img }),
          ...(name && { name }),
          ...(dob && { dob }),
          ...(gender && { gender }),
          ...(address && { address }),
          ...(phone && { phone }),
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.listen(PORT, () => {
  console.log(`Server đang lắng nghe tại cổng ${PORT}`);
});

// Ngân hàng	NCB
// Số thẻ	9704198526191432198
// Tên chủ thẻ	NGUYEN VAN A
// Ngày phát hành	07/15
// Mật khẩu OTP	123456
