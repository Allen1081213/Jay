'use client'

import React, { useState, useEffect } from 'react'
import { Collapse } from 'react-bootstrap'
import styles from './teacher-footer.module.scss'

export default function TeacherFooter() {
    const [aboutUsOpen, setAboutUsOpen] = useState(false)
    const [accountCenterOpen, setAccountCenterOpen] = useState(false)
    const [faqOpen, setFaqOpen] = useState(false)
  return (
    <div className={styles["copyright-t"]}>
      {/* 右側連結 */}
      <div className={`col-lg-8 col-md-6 col-12 ${styles["copyright-right"]} d-flex justify-content-md-end justify-content-center mt-md-0 mt-1 p-0`}>
        <div className={styles["copyright-right-div"]}>
          <div className={styles["mobile-none"]}>
            <a href="#">網站使用條款</a>
            <span>|</span>
            <a href="#">隱私權政策</a>
            <span>|</span>
            <a href="#">免責聲明</a>
            <span>|</span>
          </div>
          <div className={styles["copyright-text"]}>
            © Copyright 2025. Lenstudio Co. Ltd. All rights reserved
          </div>
        </div>
      </div>
    </div>
  )
}
