"use client";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faCamera } from "@fortawesome/free-solid-svg-icons";
import styles from "./product-button.module.scss"; // ✅ 正確引入 SCSS Module

export default function CompareButton({ product }) {
  const handleClick = () => {
    alert(`將 ${product.name} 加入比較清單！`);
  };

  return (

  <div className="icon-container">
    <div className="icon-circle">
      <i className="fa-solid fa-camera" />
    </div>
    <p className="icon-text">比較</p>
  </div>


  );
}
