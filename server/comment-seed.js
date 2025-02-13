import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

// 建立資料庫連線
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

// 假資料

const commentsData = [
  {
    id: 1,
    course_id: 1,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 2,
    course_id: 2,
    user_name: 'Emily',
    user_avatar: '/images/avatar/user_2.jpg',
    rating: 4.2,
    title: '收穫滿滿',
    content: '講師的教學方式很好，課程內容也很有層次感，學到了不少實用技巧！',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 3,
    course_id: 3,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.8,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 4,
    course_id: 4,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.9,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 5,
    course_id: 5,
    user_name: 'Emily',
    user_avatar: '/images/avatar/user_2.jpg',
    rating: 4.2,
    title: '收穫滿滿',
    content: '講師的教學方式很好，課程內容也很有層次感，學到了不少實用技巧！',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 6,
    course_id: 6,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.8,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 7,
    course_id: 7,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.0,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 8,
    course_id: 8,
    user_name: 'Emily',
    user_avatar: '/images/avatar/user_2.jpg',
    rating: 4.5,
    title: '收穫滿滿',
    content: '講師的教學方式很好，課程內容也很有層次感，學到了不少實用技巧！',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 9,
    course_id: 9,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 10,
    course_id: 10,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 11,
    course_id: 11,
    user_name: 'Emily',
    user_avatar: '/images/avatar/user_2.jpg',
    rating: 4.2,
    title: '收穫滿滿',
    content: '講師的教學方式很好，課程內容也很有層次感，學到了不少實用技巧！',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 12,
    course_id: 12,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 13,
    course_id: 13,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 14,
    course_id: 14,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 15,
    course_id: 15,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 16,
    course_id: 16,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 17,
    course_id: 17,
    user_name: 'Emily',
    user_avatar: '/images/avatar/user_2.jpg',
    rating: 4.2,
    title: '收穫滿滿',
    content: '講師的教學方式很好，課程內容也很有層次感，學到了不少實用技巧！',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 18,
    course_id: 18,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 19,
    course_id: 19,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 20,
    course_id: 20,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 21,
    course_id: 21,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 22,
    course_id: 22,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 23,
    course_id: 23,
    user_name: 'Emily',
    user_avatar: '/images/avatar/user_2.jpg',
    rating: 4.2,
    title: '收穫滿滿',
    content: '講師的教學方式很好，課程內容也很有層次感，學到了不少實用技巧！',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 24,
    course_id: 24,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 25,
    course_id: 25,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 26,
    course_id: 26,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 27,
    course_id: 27,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 28,
    course_id: 28,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 29,
    course_id: 29,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 30,
    course_id: 30,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 31,
    course_id: 31,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.1,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 32,
    course_id: 32,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 33,
    course_id: 33,
    user_name: 'Emily',
    user_avatar: '/images/avatar/user_2.jpg',
    rating: 4.2,
    title: '收穫滿滿',
    content: '講師的教學方式很好，課程內容也很有層次感，學到了不少實用技巧！',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 34,
    course_id: 34,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 35,
    course_id: 35,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.7,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 36,
    course_id: 36,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 37,
    course_id: 37,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 38,
    course_id: 38,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.9,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 39,
    course_id: 39,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 40,
    course_id: 40,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.8,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 41,
    course_id: 41,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 42,
    course_id: 42,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 43,
    course_id: 43,
    user_name: 'Emily',
    user_avatar: '/images/avatar/user_2.jpg',
    rating: 4.2,
    title: '收穫滿滿',
    content: '講師的教學方式很好，課程內容也很有層次感，學到了不少實用技巧！',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 44,
    course_id: 44,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 45,
    course_id: 45,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.3,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 46,
    course_id: 46,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 47,
    course_id: 47,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.2,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 48,
    course_id: 48,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.5,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 49,
    course_id: 49,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.6,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 50,
    course_id: 50,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.7,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 51,
    course_id: 51,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.9,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 52,
    course_id: 52,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.8,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 53,
    course_id: 53,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.4,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 54,
    course_id: 54,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.2,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
  {
    id: 55,
    course_id: 55,
    user_name: 'Alex',
    user_avatar: '/images/avatar/user_1.jpg',
    rating: 4.0,
    title: '很棒的課程！',
    content: '這堂課真的很值得，老師講解的很清楚，讓我對攝影有更深入的理解。',
    created_at: '2025-02-11 12:00:00',
  },
]

// 插入資料
async function seedDatabase() {
  try {
    const connection = await pool.getConnection()

    for (const comments of commentsData) {
      await connection.query(
        `INSERT INTO comments 
          (id, course_id, user_name, user_avatar, rating, title, content, created_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          comments.id,
          comments.course_id,
          comments.user_name,
          comments.user_avatar,
          comments.rating,
          comments.title,
          comments.content,
          comments.created_at,
        ]
      )
    }

    console.log('✅ 假評論資料插入完成！')
    connection.release()
    process.exit()
  } catch (error) {
    console.error('❌ 插入假評論資料失敗:', error)
    process.exit(1)
  }
}

// 執行
seedDatabase()
