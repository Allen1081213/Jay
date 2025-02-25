'use client'

import React, { useState, useEffect, useRef } from 'react'
import styles from './index.module.scss'
import { formatDistanceToNow, format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import ReplyInput from '../reply-input'
import MediaRenderer from '../media-render'
import GifImage from '../gif-image'
import ContentLoader from 'react-content-loader'

// 新增：回覆區段的渲染動畫元件
const NestedReplyLoader = () => {
  const numberOfLoaders = 1
  return (
    <>
      {Array.from({ length: numberOfLoaders }).map((_, index) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <ContentLoader
            speed={2}
            width={300}
            height={60}
            viewBox="0 0 300 60"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
          >
            <rect x="0" y="0" rx="5" ry="5" width="40" height="40" />
            <rect x="50" y="10" rx="4" ry="4" width="240" height="10" />
            <rect x="50" y="30" rx="4" ry="4" width="200" height="10" />
          </ContentLoader>
        </div>
      ))}
    </>
  )
}

// 新增父回覆的渲染動畫元件
const ReplyItemLoader = () => {
  return (
    <div className={`d-flex ${styles['y-reply']}`}>
      <div className={styles['y-reply-user-profile']}>
        <ContentLoader
          speed={2}
          width={50}
          height={50}
          viewBox="0 0 50 50"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
        >
          <circle cx="25" cy="25" r="25" />
        </ContentLoader>
      </div>
      <div className={`mx-3 ${styles['y-reply-content']}`}>
        <ContentLoader
          speed={2}
          width={300}
          height={20}
          viewBox="0 0 300 20"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
        >
          <rect x="0" y="0" rx="4" ry="4" width="300" height="20" />
        </ContentLoader>
        <ContentLoader
          speed={2}
          width={300}
          height={15}
          viewBox="0 0 300 15"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
        >
          <rect x="0" y="0" rx="4" ry="4" width="300" height="15" />
        </ContentLoader>
      </div>
    </div>
  )
}

// 組織留言資料，將回覆中的回覆依照 parent_id 分組
const organizeComments = (comments) => {
  const topLevel = comments.filter((c) => !c.parent_id)
  const nestedMap = {}
  comments.forEach((c) => {
    if (c.parent_id) {
      if (!nestedMap[c.parent_id]) {
        nestedMap[c.parent_id] = []
      }
      nestedMap[c.parent_id].push(c)
    }
  })
  // 將 nested replies 嵌入對應頂層留言
  return topLevel.map((comment) => ({
    ...comment,
    replies: nestedMap[comment.id] || [],
  }))
}

// 留言項目元件
function ReplyItem({
  userName,
  userProfile,
  text,
  time,
  media_urls,
  media_types,
  replies,
  likeCount: initialLikeCount,
  commentId,
  articleId,
  activeMenuId,      // 從父組件接收
  setActiveMenuId,   // 從父組件接收
  is_edited,
  updated_at,
  // 新增：接收全局編輯ID和設置函數
  currentEditingId,
  setCurrentEditingId
}) {
  // 新增：控制父回覆初次顯示的 loader
  const [showLoader, setShowLoader] = useState(true)

  const [isLiked, setIsLiked] = useState(false)
  const [commentLikeCount, setCommentLikeCount] = useState(initialLikeCount || 0)
  const [isClicked, setIsClicked] = useState(false)
  const [numVibrate, setNumVibrate] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [nestedReplies, setNestedReplies] = useState(replies || [])
  const [showNestedReplies, setShowNestedReplies] = useState(false)
  const [isNestedRepliesLoading, setIsNestedRepliesLoading] = useState(false)
  const [replyTo, setReplyTo] = useState('')
  const [moreHover, setMoreHover] = useState(false)
  const inputRef = useRef(null)

  // 將本地 isEditing 狀態與全局編輯ID綁定
  const isEditing = currentEditingId === commentId;
  const [editedText, setEditedText] = useState(text)
  const [isEdited, setIsEdited] = useState(is_edited ? true : false) // 從服務器獲取是否已編輯
  const [updatedTime, setUpdatedTime] = useState(updated_at || null) // 從服務器獲取更新時間
  const [displayText, setDisplayText] = useState(text)

  // 定義選單識別字串
  const menuKey = `reply-${commentId}`
  const isMenuOpen = activeMenuId === menuKey

  const timeAgo = updatedTime
    ? formatDistanceToNow(new Date(updatedTime), { locale: zhTW, addSuffix: true })
    : formatDistanceToNow(new Date(time), { locale: zhTW, addSuffix: true })

  const formattedTime = updatedTime
    ? format(new Date(updatedTime), 'yyyy/MM/dd HH:mm')
    : format(new Date(time), 'yyyy/MM/dd HH:mm')

  // 父回覆首次渲染時，顯示 1500 毫秒的動畫
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleLike = async () => {
    if (isLiked) {
      const newCount = commentLikeCount - 1
      setIsLiked(false)
      setCommentLikeCount(newCount)
      setNumVibrate(true)
      try {
        await fetch(`http://localhost:8000/api/likes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            likeableId: commentId,
            likeableType: 'article_comment',
            newLikeCount: newCount,
          }),
          credentials: 'include',
        })
      } catch (error) {
        console.error('Error updating comment unlike:', error)
      }
    } else {
      setIsLiked(true)
      setIsClicked(true)
      const newCount = commentLikeCount + 1
      setCommentLikeCount(newCount)
      setNumVibrate(true)
      setTimeout(() => setIsClicked(false), 300)
      try {
        await fetch(`http://localhost:8000/api/likes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            likeableId: commentId,
            likeableType: 'article_comment',
            newLikeCount: newCount,
          }),
          credentials: 'include',
        })
      } catch (error) {
        console.error('Error updating comment like count:', error)
      }
    }
  }

  // 其餘邏輯維持不變
  // 每次點擊回覆時更新 replyTo，若未顯示則打開輸入框
  const handleReplyClick = (replyUserName) => {
    setReplyTo(`@${replyUserName} `)
    if (!showReplyInput) {
      setShowReplyInput(true)
    }
  }

  useEffect(() => {
    function handleOutsideClick(e) {
      if (e.target.closest(`.${styles['y-btn-reply-in-reply']}`)) return
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowReplyInput(false)
      }
    }
    if (showReplyInput) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [showReplyInput])

  const handleNestedReplySubmitted = (newNestedReply) => {
    setNestedReplies((prev) => [newNestedReply, ...prev])
    setShowReplyInput(false)
  }

  // 父回覆不使用 nested reply 的渲染動畫，直接切換顯示/隱藏
  const toggleNestedReplies = () => {
    setShowNestedReplies((prev) => !prev)
  }

  // 修改：點擊編輯按鈕後進入編輯模式
  const handleEdit = () => {
    setEditedText(displayText); // 確保編輯框內顯示當前顯示的文字
    setCurrentEditingId(commentId);
    setActiveMenuId(null); // 關閉選單
  }

  // 取消編輯
  const handleCancelEdit = () => {
    setCurrentEditingId(null);
    setEditedText(displayText); // 恢復原始文字
  }

  // 修改：提交更新
  const handleUpdate = async () => {
    if (!editedText.trim()) return;

    try {
      const res = await fetch(`http://localhost:8000/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editedText }),
        credentials: 'include',
      });

      const data = await res.json();

      if (data.success) {
        // 立即更新視覺顯示
        setDisplayText(editedText);
        setIsEdited(true);
        setUpdatedTime(data.updatedTime);
        setCurrentEditingId(null); // 完成編輯
      } else {
        alert(data.message || '更新失敗');
      }
    } catch (error) {
      console.error('更新留言失敗:', error);
      alert('更新留言失敗，請稍後再試');
    }
  };

  const handleDelete = (id) => {
    // 實現刪除留言功能
    console.log('刪除留言', id);

    // 可以加入確認對話框
    if (confirm('確定要刪除此留言嗎？')) {
      // 呼叫 API 刪除留言
      fetch(`http://localhost:8000/api/comments/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // 從畫面上移除該留言
            // 或者重新載入留言
          }
        })
        .catch(err => console.error('刪除留言失敗:', err));
    }
  }

  const toggleMoreOptions = (e) => {
    e.stopPropagation()
    setActiveMenuId(isMenuOpen ? null : menuKey)
  }

  useEffect(() => {
    const closeMoreOptions = (e) => {
      if (isMenuOpen && !e.target.closest(`.${styles.moreBtnReply}`)) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener('click', closeMoreOptions);
    return () => {
      document.removeEventListener('click', closeMoreOptions);
    };
  }, [isMenuOpen]);

  return (
    <>
      {showLoader ? (
        <ReplyItemLoader />
      ) : (
        <div className={`d-flex ${styles['y-reply']} ${isEditing ? styles['editing-mode'] : ''}`}>
          <div className={styles['y-reply-user-profile']}>
            <a href="#">
              <img src={userProfile} alt={userName} />
            </a>
          </div>
          <div className="d-flex justify-content-between w-100 pe-2">
            <div className={`mx-3 ${styles['y-reply-content']}`}>
              <a href="#" className="text-black text-decoration-none">
                <h6 className={`mt-2 ${styles['y-reply-user-name']}`}>{userName}</h6>
              </a>

              {/* 加入遮罩層 */}
              {isEditing && <div className={styles['editing-overlay']}></div>}

              <div className={`${styles['y-reply-content']} ${isEditing ? styles['editing-area'] : ''}`}>
                <p className={`mt-3 ${styles['y-reply-text']}`}>
                  {displayText}
                </p>
              </div>
              {isEditing && (
                <div className={styles.modalOverlay}>
                  <div
                    style={{
                      width: '750px',
                      backgroundColor: 'white',
                      padding: '20px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      autoFocus
                      style={{
                        width: '100%',
                        borderRadius: '15px',
                        padding: '8px 5px 0 10px',
                        minHeight: '100px',
                        resize: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div
                      className={styles['editing-buttons']}
                      style={{ marginTop: '10px', textAlign: 'right' }}
                    >
                      <button className={styles['btn-editor-reply-cancel']} onClick={handleCancelEdit}>
                        取消
                      </button>
                      <button className={styles['btn-editor-reply-save']} onClick={handleUpdate}>
                        更新
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {media_urls &&
                media_urls.length > 0 &&
                media_urls.map((media_url, index) => {
                  const media_type = media_types[index]
                  return (
                    <MediaRenderer
                      media_type={media_type}
                      media_url={media_url}
                      key={index}
                    />
                  )
                })}
              <div className={`mt-3 d-flex align-items-center ${styles['y-reply-time-like']}`}>
                <h6
                  data-tooltip-id={`tooltip-${time}`}
                  style={{ cursor: 'pointer' }}
                  className="my-auto me-3"
                >
                  {timeAgo} {isEdited && <span className={styles.editedMark}>（已編輯）</span>}
                </h6>
                <Tooltip
                  id={`tooltip-${time}`}
                  content={formattedTime}
                  place="bottom"
                  style={{ backgroundColor: '#7E7267' }}
                />
                <div className="d-flex mb-like-reply">
                  <button className="ms-sm-3" onClick={handleLike}>
                    <img
                      src={
                        isLiked
                          ? '/images/article/thumb-up-red.svg'
                          : '/images/article/thumb-up-black.svg'
                      }
                      alt="Like"
                      style={{
                        transform: isClicked ? 'scale(1.5)' : 'scale(1)',
                        transition: 'transform 0.3s ease',
                      }}
                    />
                    <span
                      className={`${numVibrate ? styles.vibrate : ''}`}
                      onAnimationEnd={() => setNumVibrate(false)}
                      style={{ display: 'inline-block', width: '40px', textAlign: 'center' }}
                    >
                      {commentLikeCount}
                    </span>
                  </button>
                  <button
                    className={`d-flex align-items-center ms-sm-3 ${styles['y-btn-reply-in-reply']}`}
                    onClick={() => handleReplyClick(userName)}
                  >
                    <img src="/images/article/reply-origin.svg" alt="Reply" />
                    <span className={`ms-1 ${styles['reply-text']}`}>回覆</span>
                  </button>
                </div>
              </div>
              {showReplyInput && (
                <div
                  ref={inputRef}
                  id={`reply-input-${commentId}`}
                  className={styles['fade-in']}
                  style={{ transition: 'opacity 0.3s', width: '850px' }}
                >
                  <ReplyInput
                    articleId={articleId}
                    parentId={commentId}
                    onCommentSubmitted={handleNestedReplySubmitted}
                    replyTo={replyTo}
                  />
                </div>
              )}
              {nestedReplies && nestedReplies.length > 0 && (
                <>
                  <div className={`my-3 ${styles['y-hidden-reply-btn']}`}>
                    <button onClick={toggleNestedReplies}>
                      {showNestedReplies
                        ? `ㄧ 隱藏回覆`
                        : `ㄧ ${nestedReplies.length}則回覆`}
                    </button>
                  </div>
                  {showNestedReplies && (
                    <>
                      {nestedReplies.map((reply, idx) => {
                        if (!reply) return null
                        return (
                          <NestedReplyItem
                            key={reply.id || idx}
                            userName={reply?.nickname || reply?.name}
                            userProfile={reply.head}
                            text={reply.content}
                            time={reply.created_at}
                            media_urls={reply.media_urls}
                            media_types={reply.media_types}
                            parentId={reply.parent_id}
                            commentId={reply.id}
                            initialLikeCount={reply.like_count}
                            onReplyClick={handleReplyClick}
                            // 傳入全域選單管理狀態
                            activeMenuId={activeMenuId}
                            setActiveMenuId={setActiveMenuId}
                          />
                        )
                      })}
                      <div className={`my-3 ${styles['y-hidden-reply-btn']}`}>
                        <button onClick={toggleNestedReplies}>ㄧ 隱藏回覆</button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
            <div className={`${styles.moreBtnReply}`}
              onMouseEnter={() => setMoreHover(true)}
              onMouseLeave={() => setMoreHover(false)}
            >
              <button className={styles['more-btn']} onClick={toggleMoreOptions}>
                <img
                  src={moreHover ? '/images/article/more-hover.svg' : '/images/article/more-origin.svg'}
                  alt=""
                />
              </button>
              <div className={`${styles.moreOptions} ${isMenuOpen ? styles.show : ''}`}>
                <div
                  className={styles.moreOption}
                  onClick={() => handleEdit(commentId)}
                >
                  <img
                    src="/images/article/edit-origin.svg"
                    alt="編輯原圖"
                    className={styles.iconOriginal}
                  />
                  <img
                    src="/images/article/edit-hover.svg"
                    alt="編輯 hover 圖"
                    className={styles.iconHover}
                  />
                  編輯
                </div>
                <div
                  className={styles.moreOptionDelete}
                  onClick={() => handleDelete(commentId)}
                >
                  <img
                    src="/images/article/delete-origin.svg"
                    alt="刪除原圖"
                    className={styles.iconOriginalDelete}
                  />
                  <img
                    src="/images/article/delete-hover.svg"
                    alt="刪除 hover 圖"
                    className={styles.iconHoverDelete}
                  />
                  刪除
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// 回覆中的回覆元件
function NestedReplyItem({ userName, onReplyClick, parentId, activeMenuId, setActiveMenuId, ...props }) {
  const [isLiked, setIsLiked] = useState(false)
  const [commentLikeCount, setCommentLikeCount] = useState(props.initialLikeCount || 0)
  const [isClicked, setIsClicked] = useState(false)
  const [numVibrate, setNumVibrate] = useState(false)
  const [moreHover, setMoreHover] = useState(false)

  const parsedTime = new Date(props.time)
  const validTime = isNaN(parsedTime.getTime()) ? new Date() : parsedTime

  const timeAgo = formatDistanceToNow(validTime, {
    locale: zhTW,
    addSuffix: true,
  })
  const formattedTime = format(validTime, 'yyyy/MM/dd HH:mm')

  // 定義選單識別字串
  const menuKey = `nested-${props.commentId}`
  const isMenuOpen = activeMenuId === menuKey

  const toggleMoreOptions = (e) => {
    e.stopPropagation()
    setActiveMenuId(isMenuOpen ? null : menuKey)
  }

  const handleLike = async () => {
    if (isLiked) {
      const newCount = commentLikeCount - 1
      setIsLiked(false)
      setCommentLikeCount(newCount)
      setNumVibrate(true)
      try {
        await fetch(`http://localhost:8000/api/likes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            likeableId: props.commentId,
            likeableType: 'article_comment',
            newLikeCount: newCount,
          }),
          credentials: 'include',
        })
      } catch (error) {
        console.error('Error updating comment unlike:', error)
      }
    } else {
      setIsLiked(true)
      setIsClicked(true)
      const newCount = commentLikeCount + 1
      setCommentLikeCount(newCount)
      setNumVibrate(true)
      setTimeout(() => setIsClicked(false), 300)
      try {
        await fetch(`http://localhost:8000/api/likes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            likeableId: props.commentId,
            likeableType: 'article_comment',
            newLikeCount: newCount,
          }),
          credentials: 'include',
        })
      } catch (error) {
        console.error('Error updating comment like count:', error)
      }
    }
  }

  const handleNestedReplyClick = () => {
    onReplyClick && onReplyClick(userName)
    const inputElement = document.querySelector(`#reply-input-${parentId}`)
    if (inputElement) {
      inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleEdit = (id) => {
    // 實現編輯留言功能
    console.log('編輯留言', id);
    // 這裡可以打開編輯模式或跳出編輯視窗
  }

  const handleDelete = (id) => {
    // 實現刪除留言功能
    console.log('刪除留言', id);

    // 可以加入確認對話框
    if (confirm('確定要刪除此留言嗎？')) {
      // 呼叫 API 刪除留言
      fetch(`http://localhost:8000/api/comments/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // 從畫面上移除該留言
            // 或者重新載入留言
          }
        })
        .catch(err => console.error('刪除留言失敗:', err));
    }
  }

  return (
    <div className="d-flex">
      <div className={styles['y-reply-user-profile']}>
        <a href="#">
          <img src={props.userProfile} alt={userName} />
        </a>
      </div>
      <div className="d-flex justify-content-between w-100 mx-3">
        <div className={` ${styles['y-reply-content-nested-out']}`}>
          <a href="#" className="text-black text-decoration-none">
            <h6 className={`mt-2 ${styles['y-reply-user-name']}`}>{userName}</h6>
          </a>
          <div className={styles['y-reply-content-nested']}>
            <p className={`mt-3 ${styles['y-reply-text']}`}>{props.text}</p>
          </div>
          {props.media_urls &&
            props.media_urls.length > 0 &&
            props.media_urls.map((media_url, index) => (
              <MediaRenderer
                key={`${props.commentId}-media-${index}`}
                media_type={props.media_types[index]}
                media_url={media_url}
              />
            ))}
          <div className={`mt-3 d-flex align-items-center ${styles['y-reply-time-like']}`}>
            <h6
              data-tooltip-id={`tooltip-nested-${props.time}`}
              style={{ cursor: 'pointer' }}
              className="my-auto me-3"
            >
              {timeAgo}
            </h6>
            <Tooltip
              id={`tooltip-nested-${props.time}`}
              content={formattedTime}
              place="bottom"
              style={{ backgroundColor: '#7E7267' }}
            />
            <div className="d-flex mb-like-reply">
              <button className="ms-sm-3" onClick={handleLike}>
                <img
                  src={
                    isLiked
                      ? '/images/article/thumb-up-red.svg'
                      : '/images/article/thumb-up-black.svg'
                  }
                  alt="Like"
                  style={{
                    transform: isClicked ? 'scale(1.5)' : 'scale(1)',
                    transition: 'transform 0.3s ease',
                  }}
                />
                <span
                  className={`${numVibrate ? styles.vibrate : ''}`}
                  onAnimationEnd={() => setNumVibrate(false)}
                  style={{ display: 'inline-block', width: '40px', textAlign: 'center' }}
                >
                  {commentLikeCount}
                </span>
              </button>
              <button
                className={`d-flex align-items-center ms-sm-3 ${styles['y-btn-reply-in-reply']}`}
                onClick={handleNestedReplyClick}
              >
                <img src="/images/article/reply-origin.svg" alt="Reply" />
                <span className={`ms-1 ${styles['reply-text']}`}>回覆</span>
              </button>
            </div>
          </div>
        </div>
        <div className={`${styles.moreBtnReply}`}>
          <button className={styles['more-btn']} onClick={toggleMoreOptions}>
            <img
              src={moreHover ? '/images/article/more-hover.svg' : '/images/article/more-origin.svg'}
              alt="More"
            />
          </button>
          <div className={`${styles.moreOptions} ${isMenuOpen ? styles.show : ''}`}>
            <div
              className={styles.moreOption}
              onClick={() => handleEdit(props.commentId)}
            >
              <img
                src="/images/article/edit-origin.svg"
                alt="編輯原圖"
                className={styles.iconOriginal}
              />
              <img
                src="/images/article/edit-hover.svg"
                alt="編輯 hover 圖"
                className={styles.iconHover}
              />
              編輯
            </div>
            <div
              className={styles.moreOptionDelete}
              onClick={() => handleDelete(props.commentId)}
            >
              <img
                src="/images/article/delete-origin.svg"
                alt="刪除原圖"
                className={styles.iconOriginalDelete}
              />
              <img
                src="/images/article/delete-hover.svg"
                alt="刪除 hover 圖"
                className={styles.iconHoverDelete}
              />
              刪除
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 主留言區元件
export default function CommentsArea({
  articleId,
  commentCount: initialCount,
  refreshTrigger,
}) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [count, setCount] = useState(initialCount ?? 0)
  const [comments, setComments] = useState([])
  const [sortOption, setSortOption] = useState('1')
  const [activeMenuId, setActiveMenuId] = useState(null)
  const [currentEditingId, setCurrentEditingId] = useState(null)

  const toggleComments = () => setIsCollapsed((prev) => !prev)

  useEffect(() => {
    if (!articleId) return
    fetch(`http://localhost:8000/api/comments/count?articleId=${articleId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.count !== undefined) {
          setCount(data.count)
        }
      })
      .catch((err) => {
        console.error('取得留言數量失敗：', err)
      })
  }, [articleId, refreshTrigger])

  useEffect(() => {
    if (!isCollapsed && articleId) {
      const fetchComments = async () => {
        try {
          const res = await fetch(`http://localhost:8000/api/article_comments?articleId=${articleId}`);
          if (!res.ok) {
            // 檢查回應是否為 JSON 格式
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const errorData = await res.json();
              throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
            } else {
              // 如果不是 JSON 格式，則直接顯示錯誤訊息
              const errorText = await res.text();
              throw new Error(errorText || `HTTP error! status: ${res.status}`);
            }
          }
          const data = await res.json();
          setComments(organizeComments(data.comments));
        } catch (error) {
          console.error('Could not fetch comments:', error);
          // 顯示錯誤訊息給使用者
          alert('取得留言失敗：' + error.message);
        }
      };
      fetchComments();
    }
  }, [articleId, refreshTrigger, isCollapsed]);

  const getSortedComments = () => {
    const sorted = [...comments]
    if (sortOption === '1') {
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else if (sortOption === '2') {
      sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    } else if (sortOption === '3') {
      sorted.sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
    }
    return sorted
  }

  return (
    <div>
      <div className={styles['y-all-comment-btn']}>
        <button onClick={toggleComments}>
          {isCollapsed
            ? `- 共${count}則留言 -`
            : `- 隱藏全部留言 -`}
        </button>
      </div>
      {!isCollapsed && (
        <>
          <div className={`${styles['y-sort-dropdown']} my-4`}>
            <select
              id="sort-comments"
              name="sort-comments"
              className="form-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="1">由新到舊</option>
              <option value="2">由舊到新</option>
              <option value="3">熱門留言</option>
            </select>
          </div>
          <div className="pt-3">
            {getSortedComments().map((comment) => (
              <ReplyItem
                key={comment.id}
                articleId={articleId}
                commentId={comment.id}
                userName={comment.nickname || comment.name}
                userProfile={comment.head}
                text={comment.content}
                time={comment.created_at}
                media_urls={comment.media_urls}
                media_types={comment.media_types}
                replies={comment.replies}
                likeCount={comment.like_count}
                activeMenuId={activeMenuId}
                setActiveMenuId={setActiveMenuId}
                is_edited={comment.is_edited}
                updated_at={comment.updated_at}
                currentEditingId={currentEditingId}
                setCurrentEditingId={setCurrentEditingId}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

