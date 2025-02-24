'use client'

import { useEffect, useState } from 'react'
import {
  FaTimes,
  FaAddressBook,
  FaChalkboard,
  FaPlusSquare,
  FaQuestionCircle,
  FaSignOutAlt,
} from 'react-icons/fa'
import styles from './teacher-sidebar.module.scss'
import { useTeachers } from '@/hooks/use-teachers' // ✅ 使用 Context
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function TeacherSidebar() {
  const { teacher, fetchTeacherById } = useTeachers() // ✅ 獲取講師資料
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  console.log('Current pathname:', pathname)
  // ✅ 監聽 `teacher` 變化，確保 Sidebar 更新
  useEffect(() => {
    setMounted(true)
    if (!teacher) {
      fetchTeacherById('me') // ✅ 取得當前登入的講師資料
    }
  }, [teacher])

  return (
    <div className="col-md-3 col-lg-2 d-none d-xl-block">
      <div className={styles['center-sidebar']}>
        {/* ❌ 關閉側邊欄按鈕 */}
        <button className={styles['close-sidebar-btn'] + ' d-md-none'}>
          <FaTimes />
        </button>

        {/* 📌 Logo 區塊 */}
        <div className={styles['logo']}>
          <img src="/images/icon/lenstudio-logo.svg" alt="Lenstudio Logo" />
          <hr />
        </div>

        {/* 📌 講師資訊 */}
        <div className={styles['teacher-data']}>
          <div className={styles['teacher-sticker']}>
            <img
              src={teacher?.image || '/images/teachers/default-avatar.jpg'}
              alt="講師頭像"
            />
          </div>
          <h2 className={styles['teacher-name']}>
            {teacher?.name || 'Loading...'}
          </h2>
          <p className={styles['teacher-email']}>
            {teacher?.email || 'Loading...'}
          </p>
        </div>

        {/* 📌 控制中心 */}
        <div className={styles['e-control-center']}>
          <ul>
            <li
              className={
                pathname === '/teacher/teacher-edit' ? styles.active : ''
              }
            >
              <Link href="/teacher/teacher-edit">
                <FaAddressBook /> 講師資料
              </Link>
            </li>
            <li className={pathname === '/teacher'||'/teacher/course' ? styles.active : ''}>
              <Link href="/teacher">
                <FaChalkboard /> 我的課程
              </Link>
            </li>
            <li>
              <a href="">
                <FaPlusSquare /> 新增課程
              </a>
            </li>
            <li>
              <a href="">
                <FaQuestionCircle /> 客服中心
              </a>
            </li>
          </ul>

          {/* 📌 登出 */}
          <div className={styles['logout']}>
            <a href="">
              <FaSignOutAlt /> 登出
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
