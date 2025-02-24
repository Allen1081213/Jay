import pool from '../db.js'
import express from 'express'
import authenticate from '../middlewares.js'

const router = express.Router()

// ✅ 取得所有分類（從 courses 表中取得不同的 `category`）
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT DISTINCT category FROM courses'
    )

    console.log('📢 查詢到的分類:', categories)

    if (!categories || categories.length === 0) {
      return res.status(404).json({ error: '找不到分類' })
    }

    res.json(categories.map((cat) => ({ name: cat.category })))
  } catch (error) {
    console.error('❌ 無法取得分類:', error.message)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

// ✅ 取得所有課程（支援搜尋 & 排序 & 分類）
router.get('/', async (req, res) => {
  try {
    console.log('🌍 API 收到請求：', req.query)

    let { search, sort, category } = req.query
    let query = `
      SELECT 
        c.*,  
        t.name AS teacher_name, 
        t.image AS teacher_image,
        IFNULL(AVG(cm.rating), 0) AS rating,
        COUNT(cm.id) AS review_count
      FROM courses c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN comments cm ON c.id = cm.course_id
    `

    let filters = []
    let params = []

    if (search) {
      filters.push(`(c.title LIKE ? OR t.name LIKE ?)`)
      params.push(`%${search}%`, `%${search}%`)
    }

    if (category) {
      filters.push(`c.category = ?`)
      params.push(category)
    }

    if (filters.length) {
      query += ` WHERE ` + filters.join(' AND ')
    }

    query += ` GROUP BY c.id, t.id`

    if (sort) {
      if (sort === 'popular') query += ` ORDER BY c.student_count DESC`
      if (sort === 'new') query += ` ORDER BY c.created_at DESC`
      if (sort === 'low-price') query += ` ORDER BY c.sale_price ASC`
      if (sort === 'high-price') query += ` ORDER BY c.sale_price DESC`
    }

   

    const result = await pool.query(query, params)
    const courses = result[0]

  
    res.json(courses)
  } catch (error) {
    console.error('❌ 取得課程失敗:', error.stack)
    res.status(500).json({ error: '無法取得課程資料', details: error.message })
  }
})

// ✅ 取得單一課程
router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const sql = `
      SELECT 
          c.*,  
          t.name AS teacher_name, 
          t.image AS teacher_image,
          IFNULL(AVG(cm.rating), 0) AS rating, 
          COUNT(cm.id) AS comment_count
      FROM courses c
      JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN comments cm ON c.id = cm.course_id
      WHERE c.id = ?
      GROUP BY c.id, t.id;
    `
    const [rows] = await pool.execute(sql, [id])

    if (rows.length === 0) {
      return res.status(404).json({ error: '找不到該課程' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error('❌ 無法獲取課程:', error)
    res.status(500).json({ error: '無法獲取課程' })
  }
})

// ✅ 取得特定課程的所有評論
router.get('/:id/comments', async (req, res) => {
  const { id } = req.params
  try {
    const sql = `
      SELECT 
      cm.*
      FROM comments cm
      WHERE cm.course_id = ?
      ORDER BY cm.created_at DESC;
    `

    const [comments] = await pool.execute(sql, [id])

    res.json(comments)
  } catch (error) {
    console.error('❌ 無法獲取課程評論:', error)
    res.status(500).json({ error: '無法獲取課程評論' })
  }
})

// ✅ 取得同分類課程
router.get('/related/:category', async (req, res) => {
  const category = req.params.category

  try {
    const sql = `
      SELECT c.id, c.title, c.image_url, c.sale_price, c.student_count, 
       COALESCE(AVG(cm.rating), 0) AS rating, 
       t.name AS teacher_name
      FROM courses c
      JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN comments cm ON c.id = cm.course_id
      WHERE c.category = ?  
      GROUP BY c.id, t.name
      ORDER BY RAND()
      LIMIT 4;
    `

    const [rows] = await pool.execute(sql, [category])

    res.json(rows)
  } catch (error) {
    console.error('❌ 無法獲取相關課程:', error)
    res.status(500).json({ error: '無法獲取相關課程' })
  }
})


// 更新課程
router.put("/:id", authenticate, async (req, res) => {
  const courseId = req.params.id;
  const userId = req.userId; // 從 `authenticate` middleware 取得

  try {
    // **檢查課程是否存在**
    const [existingCourse] = await pool.query(
      "SELECT id FROM courses WHERE id = ? AND teacher_id = (SELECT id FROM teachers WHERE user_id = ?)",
      [courseId, userId]
    );

    console.log("📌 查詢結果:", existingCourse);

    if (existingCourse.length === 0) {
      console.log("❌ 找不到課程或無權限:", { courseId, userId });
      return res.status(404).json({ error: "❌ 找不到該課程或權限不足" });
    }

    // **執行更新**
    const { title, description, status, original_price, sale_price, category, content, image_url } = req.body;

    const sql = `
      UPDATE courses 
      SET title = ?, description = ?, status = ?, original_price = ?, sale_price = ?, category = ?, content = ?, image_url = ?
      WHERE id = ? AND teacher_id = (SELECT id FROM teachers WHERE user_id = ?)
    `;

    await pool.query(sql, [title, description, status, original_price, sale_price, category, content, image_url, courseId, userId]);

    res.json({ message: "✅ 課程更新成功！" });
  } catch (error) {
    console.error("❌ 更新課程失敗:", error);
    res.status(500).json({ error: "無法更新課程" });
  }
});


// 新增課程資訊
router.post('/', authenticate, async (req, res) => {
  const { title, description, category, original_price, sale_price, image_url, content, status } = req.body;
  const userId = req.userId; // 從 `authenticate` middleware 獲取 userId

  try {
    // 確認使用者是老師
    const [teacherRows] = await pool.query(
      'SELECT id FROM teachers WHERE user_id = ?',
      [userId]
    );

    if (teacherRows.length === 0) {
      return res.status(403).json({ error: '權限不足，非講師帳號' });
    }

    const teacherId = teacherRows[0].id;

    // 插入新課程
    const sql = `
      INSERT INTO courses (title, description, category, original_price, sale_price, image_url, content, status, teacher_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [title, description, category, original_price, sale_price, image_url, content, status, teacherId]);

    res.json({ message: '✅ 課程新增成功！', courseId: result.insertId });
  } catch (error) {
    console.error('❌ 新增課程失敗:', error);
    res.status(500).json({ error: '無法新增課程' });
  }
});


export default router
