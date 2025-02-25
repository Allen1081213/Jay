'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation' 
import styles from './course-management.module.scss'
import { FaBars, FaList, FaSearch, FaPlusSquare, FaEye } from 'react-icons/fa'
import { FiEdit, FiTrash2 } from 'react-icons/fi'
import Pagination from '../courses/_components/pagination/page'
import Link from 'next/link'

export default function CourseManagement() {
  const [user, setUser] = useState(null) 
  const [courses, setCourses] = useState([]) 
  const [loading, setLoading] = useState(true) 
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1) 
  const [authorized, setAuthorized] = useState(false);

  const router = useRouter()

  const coursesPerPage = 5

  // **權限驗證：檢查是否為老師**
  useEffect(() => {
    const fetchCoursesAndUser = async () => {
      try {
        const token = localStorage.getItem("loginWithToken");
        const userRole = localStorage.getItem("userRole"); // ✅ 先從 localStorage 讀取角色
  
        if (!token) {
          console.log("❌ 沒有 Token，跳轉登入頁面");
          router.push("/login");
          return;
        }
  
        if (userRole !== "teacher") {
          console.warn("⚠️ 非教師帳號，無權進入此頁面");
          router.push("/user");
          return;
        }
  
        console.log("✅ 取得課程資訊...");
        const res = await fetch("http://localhost:8000/api/teachers/me/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (res.status === 403) {
          console.warn("⚠️ 403 Forbidden，無權限");
          router.push("/user");
          return;
        }
  
        if (!res.ok) throw new Error(`API 錯誤: ${res.status}`);
  
        const data = await res.json();
        console.log("✅ 取得課程與使用者資訊:", data);
  
        setUser({
          name: data[0].teacher_name,
          level: data[0].level,
          email: data[0].mail,
        });
  
        setCourses(data);
        setAuthorized(true); // ✅ 確認用戶有權限
      } catch (error) {
        console.error("❌ 獲取使用者與課程失敗:", error);
        router.push("/login");
      } finally {
        setLoading(false); // ✅ 確保 UI 在加載完成後才渲染
      }
    };
  
    fetchCoursesAndUser();
  }, []);
  
  // ✅ 如果還在 loading，顯示載入中
  if (loading) return <p>⏳ 正在驗證您的身份...</p>;
  
  // ✅ 如果沒有權限，直接返回 null，不渲染畫面
  if (!authorized) return null;
  

  

  useEffect(() => {
    console.log(`📌 目前的 courses:`, courses)
    if (courses.length > 0) {
      setCurrentPage(1)
    }
  }, [courses])

  // **搜尋 & 分頁**
  const filteredCourses = courses.filter(
    (course) =>
      course.title.includes(searchTerm) || course.category.includes(searchTerm)
  )

  // **如果 `filteredCourses` 為空，不計算分頁**
  const totalPages =
    filteredCourses.length > 0
      ? Math.ceil(filteredCourses.length / coursesPerPage)
      : 1
  const indexOfLastCourse = currentPage * coursesPerPage
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage
  const currentCourses = filteredCourses.slice(
    indexOfFirstCourse,
    indexOfLastCourse
  )

  console.log(`📌 當前顯示的課程列表:`, currentCourses)
  console.log(`📌 當前頁碼:`, currentPage, ` / 總頁數:`, totalPages)

  // **等待使用者載入完成，避免閃爍**
  if (loading) return <p>⏳ 載入中...</p>

  return (
    <>
      <button className="btn btn-dark d-xl-none">
        <FaBars />
      </button>

      <div className={styles['center-content']}>
        <div className={styles['nav-bar']}>
          <h1>課程管理中心</h1>
          <p>
            您好，{user?.name}
            ！歡迎來到您的專屬教學平台，立即規劃並管理您的課程吧！
          </p>
        </div>

        <div className={styles['control-btns']}>
          <div className={styles['btns-left']}>
            <div className={styles['filter']}>
              <a href="#">
                <FaList />
                <p>篩選</p>
              </a>
            </div>

            <div className={styles['course-search']}>
              <input
                className={styles['search-input']}
                type="text"
                placeholder="搜尋課程"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className={styles['search-btn']}>
                <FaSearch />
              </button>
            </div>
          </div>

          <div className={styles['add']}>
            <Link href="/teacher/course/course-add">
              <FaPlusSquare />
              <p>新增課程</p>
            </Link>
          </div>
        </div>

        <div className={styles['table-container']}>
          <table>
            <thead>
              <tr>
                <th>課程圖片</th>
                <th>課程名稱</th>
                <th>課程分類</th>
                <th>建立日期</th>
                <th>售價</th>
                <th>銷售量</th>
                <th>學生人數</th>
                <th>發布狀態</th>
                <th>編輯</th>
                <th>刪除</th>
              </tr>
            </thead>
            <tbody>
              {currentCourses.map((course) => {
                console.log(`📌 顯示課程:`, course)
                const safeImage = course.image_url
                  ? course.image_url
                  : `/uploads/course-cover/${course.image_url}` ||
                    '/images/course-cover/default-course.jpg'
                return (
                  <tr key={course.id}>
                    <td className={styles['course-img']}>
                      <Link
                        href={`/courses/${course.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className={styles['image-container']}>
                          <img
                            src={safeImage}
                            alt={course.title}
                            className="img-fluid"
                          />
                          <div className={styles['overlay']}>
                            <FaEye className={styles['view-icon']} />
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td>{course.title}</td>
                    <td>{course.category}</td>
                    <td>
                      {new Date(course.created_at).toLocaleDateString('zh-TW', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </td>
                    <td>{course.sale_price.toLocaleString()}</td>
                    <td>
                      NT$
                      {(
                        course.sale_price * course.student_count
                      ).toLocaleString()}
                    </td>
                    <td>{course.student_count.toLocaleString()}</td>
                    <td>
                      <div className={styles['state-circle']}>
                        <div
                          className={` ${
                            course.status === 'published'
                              ? styles['published']
                              : styles['draft']
                          }`}
                        ></div>
                        {course.status === 'published' ? '上架中' : '未上架'}
                      </div>
                    </td>
                    <td>
                      <Link
                        href={`/teacher/course/course-edit?id=${course.id}`}
                      >
                        <button className={styles['edit-btn']}>
                          <FiEdit />
                        </button>
                      </Link>
                    </td>
                    <td>
                      <button className={styles['delete-btn']}>
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </>
  )
}
