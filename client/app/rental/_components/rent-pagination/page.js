// rent-pagination

'use client'

import { useState, useEffect } from 'react'

export default function RentPagination({
  totalItems = 1,
  itemsPerPage = 1,
  onPageChange,
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  useEffect(() => {
    if (onPageChange) onPageChange(currentPage)
  }, [currentPage, onPageChange])

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== currentPage) {
      setCurrentPage(pageNumber)
    }
  }

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1)
  }

  // 📌 **計算顯示的頁碼範圍**
  let startPage = Math.max(1, currentPage - 2)
  let endPage = Math.min(totalPages, currentPage + 2)

  if (endPage - startPage < 4) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, startPage + 4)
    } else if (endPage === totalPages) {
      startPage = Math.max(1, endPage - 4)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center mt-4 mb-1">
      {/* 📌 上一頁按鈕 */}
      <button
        className="page-link"
        onClick={handlePrev}
        disabled={currentPage === 1}
      >
        &laquo;
      </button>

      {/* 📌 產生頁碼按鈕 */}
      {Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
      ).map((page) => (
        <button
          key={page}
          className={`page-link ${
            currentPage === page
              ? 'btn-primary active border-dark'
              : 'btn-outline-primary'
          }`}
          style={{
            fontWeight: currentPage === page ? 'bold' : 'normal',
            cursor: currentPage === page ? 'default' : 'pointer',
            color: currentPage === page ? '#252525' : 'inherit', // ✅ 當前頁數字變深色
          }}
          onClick={() => handlePageClick(page)}
        >
          {page}
        </button>
      ))}

      {/* 📌 下一頁按鈕 */}
      <button
        className="page-link"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        &raquo;
      </button>
    </div>
  )
}
