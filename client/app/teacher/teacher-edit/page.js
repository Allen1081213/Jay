"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./teacher-edit.module.scss";
import { toast } from "react-toastify";
import { useTeachers } from "@/hooks/use-teachers";

export default function TeacherEdit() {
  const fileInputRef = useRef(null);
  const [previewImg, setPreviewImg] = useState("/images/teachers/default-avatar.jpg");
  const { teacher, fetchTeacherById } = useTeachers();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    website: "",
    facebook: "",
    instagram: "",
    youtube: "",
    image: "/images/teachers/default-avatar.jpg",
  });

  // ✅ 確保 `teacher` 存在後才更新 `formData`
  useEffect(() => {
    if (!teacher) {
      fetchTeacherById("me");
    } else if (teacher !== null) {  // 🔹 確保 teacher 不為 null
      setFormData({
        name: teacher?.name || "",
        email: teacher?.email || "",
        bio: teacher?.bio || "",
        website: teacher?.website || "",
        facebook: teacher?.facebook || "",
        instagram: teacher?.instagram || "",
        youtube: teacher?.youtube || "",
        image: teacher?.image || "/images/teachers/default-avatar.jpg",
      });
      setPreviewImg(teacher?.image || "/images/teachers/default-avatar.jpg");
      setLoading(false);
    }
  }, [teacher]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({ ...prev, image: event.target.result }));
        setPreviewImg(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("loginWithToken");

    if (!token) {
      toast.error("❌ 請先登入");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/teachers/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("更新失敗");

      toast.success("講師資料更新成功！", { autoClose: 3000 });

      await fetchTeacherById("me"); // ✅ 更新 Context
    } catch (error) {
      console.error(error);
      toast.error("更新失敗");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>載入中...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className={styles["center-content"]}>
      <div className={styles["nav-bar"]}>
        <h1>編輯講師資料</h1>
      </div>

      {/* 📌 確保 teacher 不是 null 再渲染表單 */}
      {teacher !== null ? (
        <form className={styles["teacher-edit"]} onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-4">
              <div className={styles["form-group"]}>
                <label>講師照片 <span className={styles["required"]}>*</span></label>
                <div className={styles["image-upload"]} onClick={handleUploadClick}>
                  <img src={previewImg} alt="講師圖片" />
                  <input
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                </div>
              </div>
            </div>

            <div className="col-md-8">
              <div className={styles["form-row"]}>
                <div className={styles["form-group"]}>
                  <label>講師名稱 <span className={styles["required"]}>*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles["form-group"]}>
                  <label>電子郵件 <span className={styles["required"]}>*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className={styles["form-group"]}>
                <label>講師簡介 <span className={styles["required"]}>*</span></label>
                <textarea
                  className={styles["teacher-info"]}
                  name="bio"
                  rows="5"
                  value={formData.bio}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {["website", "facebook", "instagram", "youtube"].map((field) => (
                <div key={field} className={styles["form-group"]}>
                  <label>{field.toUpperCase()}</label>
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                  />
                </div>
              ))}

              <div className={styles["form-actions"]}>
                <button type="submit" className={styles["save-btn"]} disabled={loading}>
                  {loading ? "儲存中..." : "儲存"}
                </button>
                <button type="button" className={styles["cancel-btn"]}>
                  返回課程列表
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <p>無法獲取講師資料</p>
      )}
    </div>
  );
}
