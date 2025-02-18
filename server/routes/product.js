import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken"; // ✅ 確保用戶登入

const router = express.Router();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "12345",
  database: process.env.DB_DATABASE || "lenstudio",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

//cors設定
const corsOptions = {
  origin: ['http://localhost:3000'], // 允許來自 http://localhost:3000 的請求
  credentials: true,
};

router.use(cors(corsOptions)); // 使用 cors 中間件


router.get("/", async (req, res) => { 
  try {
    const connection = await pool.getConnection();
    
    // 取得查詢參數
    const { brand_id, category_id, subcategory_id,min_price, max_price, sort } = req.query;
    
    
    // 構建 SQL 查詢條件
    let whereClause = "WHERE 1=1";
    const queryParams = [];

    if (brand_id) {
      whereClause += " AND p.brand_id = ?";
      queryParams.push(brand_id);
    }

    if (category_id) {
      whereClause += " AND p.category_id = ?";
      queryParams.push(category_id);
    }

    if (subcategory_id) {
      whereClause += " AND p.subcategory_id = ?";
      queryParams.push(subcategory_id);
    }

   // ✅ 確保 `min_price` 和 `max_price` 只有在用戶輸入時才會加入查詢
   const minPriceNum = min_price ? Number(min_price) : null;
   const maxPriceNum = max_price ? Number(max_price) : null;

   if (!isNaN(minPriceNum) && minPriceNum !== null) {
     whereClause += " AND p.price >= ?";
     queryParams.push(minPriceNum);
   }

   if (!isNaN(maxPriceNum) && maxPriceNum !== null) {
     whereClause += " AND p.price <= ?";
     queryParams.push(maxPriceNum);
   }

    // ✅ 設定排序條件
     // ✅ 預設排序為 `id` 升序
     let orderByClause = "ORDER BY p.id ASC";
     if (sort === "price_asc") {
       orderByClause = "ORDER BY p.price ASC";
     } else if (sort === "price_desc") {
       orderByClause = "ORDER BY p.price DESC";
     }
    // 執行 SQL 查詢
    const [rows] = await connection.query(`
      SELECT 
        p.id, 
        p.name, 
        p.price, 
        p.brand_id, 
        p.category_id, 
        p.subcategory_id, 
        b.brand_name AS brand_name,  
        CONCAT('/images/product/', COALESCE(i.image_url, 'default.jpg')) AS image_url
      FROM product p
      LEFT JOIN brand b ON p.brand_id = b.brand_id
      LEFT JOIN image i ON p.id = i.product_id AND i.is_main = 1
      ${whereClause}
      ${orderByClause}  -- ✅ 確保正確排序
    `, queryParams);

    connection.release();

    // 🔍 確保 API 回傳了 `image_url`
    console.log("📌 取得的產品資料:", rows);

    res.json(rows); 
  } catch (error) {
    console.error("獲取商品錯誤:", error);
    res.status(500).json({ error: "無法獲取商品", details: error.message });
  }
});

// 簡化測試路由
router.get("/test", async (req, res) => {
  try {
    res.json({ message: "API is working!" });
  } catch (error) {
    console.error("測試路由錯誤:", error);
    res.status(500).json({ error: "無法獲取測試資料", details: error.message });
  }
});

// 新增獲取廣告的路由
router.get("/ads", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [ads] = await connection.query(`
      SELECT 
        id, 
        product_id, 
        video_url
      FROM ads
    `);
    connection.release();
    res.json(ads);
  } catch (error) {
    console.error("獲取廣告錯誤:", error);
    res.status(500).json({ error: "無法獲取廣告", details: error.message });
  }
});

router.get("/filters", async (req, res) => { 
  try {
    const connection = await pool.getConnection();
    
    const [brand] = await connection.query(`SELECT brand_id AS id, brand_name AS name FROM brand`);
    const [category] = await connection.query(`SELECT category_id AS id, category_name AS name FROM category`);
    const [subcategory] = await connection.query(`SELECT subcategory_id AS id, name AS name FROM subcategory`);
    
    connection.release();
    
    res.json({
      brand,
      category,
      subcategory,
    });

  } catch (error) {
    console.error("獲取篩選條件錯誤:", error);
    res.status(500).json({ error: "無法獲取篩選條件", details: error.message });
  }
})

router.get("/brand", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [brand] = await connection.query(`SELECT brand_id AS id, brand_name AS name FROM brand`);

    connection.release();

    res.json(brand); 
  } catch (error) {
    console.error("取得品牌時發生錯誤:", error);
    res.status(500).json({ error: "伺服器錯誤", details: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const { id } = req.params;

    const [rows] = await connection.query(
      `SELECT 
        p.id, 
        p.name, 
        p.short_introduce,
        p.introduce,
        p.price,
        p.brand_id,
        b.brand_name AS brand_name,  
        CONCAT('/images/product/', COALESCE(i.image_url, 'default.jpg')) AS image_url
      FROM product p
      LEFT JOIN brand b ON p.brand_id = b.brand_id
      LEFT JOIN image i ON p.id = i.product_id AND i.is_main = 1
      WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "商品未找到" });
    }

    const [images] = await connection.query(
      `SELECT CONCAT('/images/product/', image_url) AS image
       FROM image
       WHERE product_id = ?`,
      [id]
    );

      // ✅ 3️⃣ 單獨查詢 `specs`
      const [specs] = await connection.query(
        `SELECT 
           camera_format, 
           release_date,
           waterproof_level,
          image_stabilization
         FROM spec
         WHERE product_id = ?`,
        [id]
      );

    connection.release();

    // ✅ 返回完整的商品数据
    res.json({
      ...rows[0],
      images: images.map((img) => img.image),
      specs: specs.length > 0 ? specs : [],
    });

  } catch (error) {
    console.error("取得商品错误:", error);
    res.status(500).json({ error: "伺服器錯誤", details: error.message });
  }
});

router.get("/related/:brand_id/:current_id", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const { brand_id, current_id } = req.params;

    const [products] = await connection.query(
      `SELECT 
        p.id, 
        p.name, 
        p.price, 
        CONCAT('/images/product/', COALESCE(i.image_url, 'default.jpg')) AS image
      FROM product p
      LEFT JOIN image i ON p.id = i.product_id AND i.is_main = 1
      WHERE p.brand_id = ? AND p.id != ?
      ORDER BY p.id ASC 
      LIMIT 8`,
      [brand_id, current_id]
    );

    connection.release();
    res.json(products);
  } catch (error) {
    console.error("取得相關產品錯誤:", error);
    res.status(500).json({ error: "伺服器錯誤", details: error.message });
  }
});

router.get("/spec/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await pool.getConnection();
    const query = "SELECT * FROM spec WHERE product_id = ?"; // ✅ 確保表格名稱正確
    const [rows] = await connection.execute(query, [id]);

    connection.release(); // ✅ 釋放連線

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: `❌ 找不到 product_id = ${id} 的規格` });
    }

    res.json(rows[0]); // ✅ 回傳第一筆規格數據
  } catch (error) {
    console.error("❌ 伺服器錯誤:", error);
    res.status(500).json({ error: "❌ 伺服器錯誤，請檢查 API" });
  }
});

// ✅ 確保請求帶有 JWT Token
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "未授權，請先登入" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "無效的 Token" });
  }
};

// ✅ 取得用戶的收藏列表
router.get("/collection", authenticateUser, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const user_id = req.users.id; // ✅ 取得用戶 ID

    const [favorites] = await connection.query(
      "SELECT product_id FROM collection WHERE users_id = ?",
      [user_id]
    );

    connection.release();
    res.json(favorites);
  } catch (error) {
    console.error("❌ 無法獲取收藏清單:", error);
    res.status(500).json({ error: "伺服器錯誤" });
  }
});

// ✅ 加入收藏
router.post("/", authenticateUser, async (req, res) => {
  try {
    const { product_id } = req.body;
    const user_id = req.users.id; // ✅ 從 JWT 取得用戶 ID

    // 檢查是否已收藏
    const [existing] = await pool.query(
      "SELECT * FROM collection WHERE users_id = ? AND product_id = ?",
      [user_id, product_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "此商品已收藏" });
    }

    await pool.query(
      "INSERT INTO collection (users_id, product_id) VALUES (?, ?)",
      [user_id, product_id]
    );

    res.json({ message: "成功加入收藏" });
  } catch (error) {
    console.error("❌ 收藏失敗:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
});

// ✅ 取消收藏
router.delete("/", authenticateUser, async (req, res) => {
  try {
    const { product_id } = req.body;
    const user_id = req.users.id; // ✅ 從 JWT 取得用戶 ID

    await pool.query(
      "DELETE FROM collection WHERE users_id = ? AND product_id = ?",
      [user_id, product_id]
    );

    res.json({ message: "已取消收藏" });
  } catch (error) {
    console.error("❌ 移除收藏失敗:", error);
    res.status(500).json({ message: "伺服器錯誤" });
  }
});

export default router; 
