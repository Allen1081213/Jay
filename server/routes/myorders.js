import express, { json } from "express";
import pool from "../db.js";
import authenticate from '../middlewares.js';
import jwt from "jsonwebtoken";

const portNum = 3005;

const whiteList = ["http://localhost:5500", "http://localhost:8000", "http://localhost:3000"];
const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin || whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("不允許連線"));
    }
  },
};

const secretKey = process.env.JWT_SECRET_KEY;
const router = express.Router();

//我的租賃//
router.get("/rent", checkToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const userId = req.decoded.id;

    console.log("🔍 獲取用戶 ID:", userId);
    if (!userId) {
      return res.status(400).json({ error: "無效的用戶 ID" });
    }

    const [products] = await connection.query(
      `SELECT 
    ur.id AS rental_order_id, 
    ur.user_id, 
    ur.rent_id, 
    ur.rent_fee, 
    ur.start_date, 
    ur.end_date, 
    ur.status, 
    ur.rating, 
    ur.comment, 
    ur.comment_at, 
    u.name AS user_name, 
    r.name AS product_name, 
    r.brand AS brand_name,
    r.fee, 
    r.stock, 
    r.status AS availability, 
    CONCAT('/images/rental/', COALESCE(
        (SELECT ri.url FROM rent_image ri WHERE ri.rent_id = ur.rent_id ORDER BY ri.sequence ASC LIMIT 1), 
        'default'
    ), '.png') AS image_url
    FROM user_rentals ur
    JOIN users u ON ur.user_id = u.id
    JOIN rental r ON ur.rent_id = r.id
    WHERE ur.user_id = ?
    ORDER BY ur.start_date DESC;
`,
      [userId]
    );

    console.log("🔍 SQL 查詢結果:", products);
    connection.release();

    if (products.length === 0) {
      return res.json({ products: [] });
    }

    res.json({ products });
  } catch (error) {
    console.error("🚨 取得租賃訂單錯誤:", error);
    res.status(500).json({ error: "伺服器錯誤", details: error.message });
  }
});

//我的租賃 end 

//我的課程
router.get("/course", checkToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const userId = req.decoded.id;

    console.log("🔍 獲取用戶 ID:", userId);
    if (!userId) {
      return res.status(400).json({ error: "無效的用戶 ID" });
    }

    const [courses] = await connection.query(
      `SELECT 
    uc.id AS course_order_id, 
    uc.user_id, 
    uc.courses_id,
    uc.name AS course_name,
    uc.price,
    c.title,
    c.image_url AS course_image,
    c.teacher_id AS instructor,
    t.name AS instructor_name 
    FROM user_courses uc
    JOIN users u ON uc.user_id = u.id
    JOIN courses c ON uc.courses_id = c.id
    JOIN teachers t ON c.teacher_id = t.id
    WHERE uc.user_id = ?
    ORDER BY uc.id DESC;
`,
      [userId]
    );

    console.log("🔍 SQL 查詢結果:", courses);
    connection.release();

    if (courses.length === 0) {
      return res.json({ courses: [] });
    }

    res.json({ courses });
  } catch (error) {
    console.error("🚨 取得租賃訂單錯誤:", error);
    res.status(500).json({ error: "伺服器錯誤", details: error.message });
  }
});


//我的課程 end
function checkToken(req, res, next) {
  let token = req.get("Authorization");

  console.log("🔍 收到 Token:", token); // ✅ 檢查 Token 是否存在

  if (!token) {
    console.log("❌ Token 不存在，請求被拒絕");
    return res.status(401).json({ status: "error", message: "未提供驗證資料，請重新登入" });
  }

  if (!token.startsWith("Bearer ")) {
    console.log("❌ Token 格式錯誤:", token);
    return res.status(401).json({ status: "error", message: "驗證格式錯誤，請重新登入" });
  }

  token = token.slice(7); // ✅ 移除 "Bearer " 前綴

  console.log("🔍 解析 Token:", token);

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.log("❌ Token 驗證失敗:", err.message);
      return res.status(401).json({ status: "error", message: "驗證失敗或已過期，請重新登入" });
    }

    console.log("✅ Token 驗證成功:", decoded);
    req.decoded = decoded;
    next();
  });
}

/* PK專用 */

// 更新評論 API
router.put('/rent/reviews/:id', authenticate, async (req, res) => {
  try {
    console.log("🔍 收到的評論資料:", req.body); // ✅ 這行新增來 debug


    const { id } = req.params;
    const { comment, rating } = req.body;
    const userId = req.user.id;

    if (!comment || rating === undefined) {
      return res.status(400).json({ success: false, error: '評論內容與評分不得為空' });
    }



    // 檢查訂單是否符合條件
    const [rental] = await pool.query(
      `SELECT status, comment_at FROM user_rentals WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (rental.length === 0) {
      return res.status(404).json({ success: false, error: '找不到符合條件的訂單' });
    }

    const { status, comment_at } = rental[0];

    if (status !== '已完成') {
      return res.status(400).json({ success: false, error: '僅已完成的訂單才能評論' });
    }

    if (comment_at !== null) {
      return res.status(400).json({ success: false, error: '評論已提交，無法修改' });
    }

    // 更新評論與評分，並設定評論時間
    await pool.query(
      `UPDATE user_rentals SET comment = ?, rating = ?, comment_at = NOW() WHERE id = ? AND user_id = ?`,
      [comment, rating, id, userId]
    );

    res.json({ success: true, message: '評論已成功提交' });
  } catch (error) {
    console.error('❌ 更新評論錯誤:', error);
    res.status(500).json({ success: false, error: '伺服器錯誤' });
  }
});

/* PK專用 */

export default router;