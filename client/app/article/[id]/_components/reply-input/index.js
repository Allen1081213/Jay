'use client'

import React, { useState, useCallback, useRef } from 'react'
import axios from 'axios'
import { GiphyFetch } from '@giphy/js-fetch-api'
import { Grid } from '@giphy/react-components'
import styles from './index.module.scss'

// 初始化 GiphyFetch 實例
const gf = new GiphyFetch('6Jxrd3sSeXRfaOs952JGsXJYC5uIASsC')

// 錯誤邊界組件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    console.error('Error captured in ErrorBoundary:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Detailed error info:', errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <p>發生錯誤，請稍後再試。</p>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>詳細錯誤資訊</summary>
            {this.state.error && this.state.error.toString()}
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      )
    }
    return this.props.children
  }
}

// 主組件
export default function ReplyInput({ articleId, parentId }) {
  const [comment, setComment] = useState('') // 留言文字
  const [previews, setPreviews] = useState([]) // 圖片和 GIF 預覽
  const [showGifPicker, setShowGifPicker] = useState(false) // 是否顯示 GIF 選擇器
  const [searchTerm, setSearchTerm] = useState('') // GIF 搜尋用的關鍵字
  const [isHovered, setIsHovered] = useState(false) // 新增 hover state
  const [isSent, setIsSent] = useState(false) // 是否已送出
  const fileInputRef = useRef(null) // 文件上傳輸入框的參考引用
  const userId = 1 // 預設用戶 ID（可以改為動態獲取登入使用者資訊）

  // 文件改變
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    let selectedFiles = []
    const videoFiles = files.filter((file) => file.type.startsWith('video'))
    if (videoFiles.length > 0) {
      selectedFiles = [videoFiles[0]]
    } else {
      const imageFiles = files.filter((file) => file.type.startsWith('image'))
      if (imageFiles.length > 0) {
        selectedFiles = [imageFiles[0]]
      }
    }

    const previewURLs = selectedFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type,
    }))
    setPreviews(previewURLs)
  }

  // 觸發文件上傳
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // 移除圖片/影片預覽
  const removePreview = (index) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // 處理 GIF 選擇
  const handleGifSelect = (gif) => {
    setPreviews([{ url: gif.images.original.url, type: 'gif' }])
    setShowGifPicker(false)
  }

  // 留言送出
// 留言送出
const handleSubmit = async () => {
  if (
    !comment.trim() &&
    !(fileInputRef.current && fileInputRef.current.files.length > 0) &&
    !(previews.length && previews[0].type === 'gif')
  )
    return

  const formData = new FormData()
  formData.append('content', comment)
  formData.append('articleId', articleId)
  formData.append('userId', userId)
  formData.append('parentId', parentId || '')

  if (fileInputRef.current && fileInputRef.current.files.length > 0) {
    for (const file of fileInputRef.current.files) {
      formData.append('media', file)
    }
  } else if (previews.length && previews[0].type === 'gif') {
    formData.append('gifUrl', previews[0].url)
  }

  try {
    const response = await axios.post(
      'http://localhost:8000/api/comments',
      formData,
      {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    )
    console.log('留言新增成功：', response.data)
    // 清空留言及附件預覽
    setComment('')
    setPreviews([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    // 執行送出成功後按鈕放大效果
    setIsSent(true)
    setTimeout(() => setIsSent(false), 300)
  } catch (error) {
    console.error('留言送出失敗：', error)
  }
}

  // 根據是否有文字或預覽判定是否可發送
  const isReadyToSend = comment.trim().length > 0 || previews.length > 0

  // 設定發送按鈕圖示，條件為是否可發送以及是否 hover
  const sendIcon = isReadyToSend
    ? isHovered
      ? '/images/article/sended-hover.svg'
      : '/images/article/sended.svg'
    : isHovered
    ? '/images/article/sended-hover.svg'
    : '/images/article/sended-black.svg'

  // GEO API 請求搜尋 GIF
  const searchGifs = useCallback(
    async (offset) => {
      try {
        if (!searchTerm.trim()) {
          return await gf.trending({ offset, limit: 10 })
        } else {
          return await gf.search(searchTerm.trim(), { offset, limit: 10 })
        }
      } catch (error) {
        console.error('Error fetching GIFs:', error)
        return { data: [] } // 必須返回空結果以防止 Grid 錯誤
      }
    },
    [searchTerm]
  )

  function handleSearch() {
    // 直接呼叫 this.searchGifs 相關邏輯
    console.log('執行搜尋邏輯：', searchTerm)
    // 或者 setGifResult(...) 執行 UI 更新等
  }

  return (
    <div
      className={`p-3 bg-white border border-secondary ${styles['y-comment-area']}`}
    >
      <input
        type="text"
        id="comment"
        className="p-2 py-3"
        placeholder="留言"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div
        className={`mt-2 d-flex justify-content-end ${styles['y-comment-area-icons']}`}
      >
        <div className="d-flex">
          <button className="p-1" onClick={triggerFileInput}>
            <img
              src="/images/article/imageup-b.svg"
              alt="圖/影"
              className={styles['imageup-icon']}
            />
          </button>
          <button
            className="p-1"
            onClick={() => setShowGifPicker(!showGifPicker)}
          >
            <img
              src="/images/article/gif-icon-b.svg"
              alt="選擇 GIF"
              className={showGifPicker ? styles.active : ''}
            />
          </button>
          <button
            className="p-1 sendIcon"
            style={{ transition: 'transform 0.3s ease', transform: isSent ? 'scale(1.5)' : 'scale(1)' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleSubmit}
          >
            <img src={sendIcon} alt="發送" />
          </button>
        </div>
      </div>
      {previews.length > 0 && (
        <div style={{ width: '20%', marginTop: '1rem' }}>
          {previews.map((file, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                marginBottom: '0.5rem',
                display: 'flex',
              }}
            >
              {file.type.startsWith('image') ? (
                <img
                  src={file.url}
                  alt={`預覽-${index}`}
                  style={{ width: '100%', borderRadius: '15px' }}
                />
              ) : file.type === 'gif' ? (
                <img
                  src={file.url}
                  alt={`預覽-${index}`}
                  style={{ width: '100%', borderRadius: '15px' }}
                />
              ) : (
                <video
                  src={file.url}
                  style={{ width: '100%', borderRadius: '15px' }}
                />
              )}
              <div
                onClick={() => removePreview(index)}
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  backgroundColor: 'red',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{ color: 'white', fontSize: '14px', lineHeight: '0' }}
                >
                  ✕
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {showGifPicker && (
        <div style={{ width: '100%', marginTop: '1rem' }}>
          <ErrorBoundary>
            <input
              type="text"
              value={searchTerm}
              placeholder="搜尋 GIF"
              className="mb-2 border border-dark py-2 rounded ps-2"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div
              style={{
                position: 'relative',
                width: '800px',
                height: '600px',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              <Grid
                fetchGifs={searchGifs}
                key={searchTerm} // 讓 searchTerm 改變時強制重新渲染
                width={800} // 與父層寬度一致
                columns={3}
                gutter={6}
                onGifClick={(gif, e) => {
                  e.preventDefault() // 避免導到外部網頁
                  handleGifSelect(gif)
                }}
              />
            </div>
          </ErrorBoundary>
        </div>
      )}
    </div>
  )
}
