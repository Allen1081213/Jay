"use client"

import styles from "./shopping-cart-empty.module.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function CartEmptyPage(){
    let cartStorage = JSON.parse(localStorage.getItem("cart")) || {};
    const isCartEmpty = Object.keys(cartStorage).length === 0;
    return(
        
        <>
        {isCartEmpty ? <div className={"container d-xs-flex flex-sm-column pt-5"}>
                <div className="j-shoppingCartTitleBox mb-5 row justify-content-center mt-5 pt-5">
                    <div className="col-12 text-center">
                        <h1 className="j-shoppingCartTitle m-0 ">我的購物車</h1>
                    </div>
                    <div className="col-12 text-center">
                        <small>您的購物車目前沒有作品</small>
                    </div>
                </div>
                <div className="j-emptyShoppingImgBox row justify-content-center position-relative mb-sm-5 pb-sm-4">
                    <div className="j-emptyShoppingImg me-5 d-none d-sm-block col-4">
                        <img src="/images/cart/image2.jpg" alt="" />
                        <div className="d-flex flex-column j-emptyShoppingTitle position-absolute">
                            <span className="mb-2 j-AllcameraTitle j-publicFont">所有相機</span>
                            <span className="mb-4 j-publicFont">立即尋找所有作品</span>
                            <Link href={"/product"} className="j-linkCamera text-center">尋找我的相機</Link>
                        </div>
                    </div>
                    <div className="j-emptyShoppingImg d-sm-none d-block col-6">
                        <img src="/images/cart/image2.jpg" alt="" />
                        <div className="d-flex flex-column j-emptyShoppingTitle position-absolute">
                            <span className="mb-2 j-AllcameraTitle j-publicFont">所有相機</span>
                            <span className="mb-4 j-publicFont">立即尋找所有作品</span>
                            <Link href={"/product"} className="j-linkCamera j-linkCamera text-center">尋找我的相機</Link>
                        </div>
                    </div>
                    <div className="
j-illustrateBox d-flex flex-column position-relative d-none d-sm-block col-4">
                        <div className="j-illustrate position-absolute">
                            <p className="mb-3"><svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none">
                                <path d="M5.14325 17.0283H4.22896C3.21907 17.0283 2.40039 16.2096 2.40039 15.1997V6.97115C2.40039 5.96126 3.21907 5.14258 4.22896 5.14258H12.4575C13.4674 5.14258 14.2861 5.96126 14.2861 6.97115V15.1997C14.2861 16.2096 13.4674 17.0283 12.4575 17.0283H11.5432M15.6575 17.0283H15.2004C14.6954 17.0283 14.2861 16.619 14.2861 16.114V8.34258C14.2861 7.83763 14.6954 7.42829 15.2004 7.42829H17.5038C17.7816 7.42829 18.0442 7.55455 18.2178 7.77143L21.4 11.7493C21.5297 11.9114 21.6004 12.1128 21.6004 12.3204V16.114C21.6004 16.619 21.191 17.0283 20.6861 17.0283M10.629 16.5711C10.629 17.8335 9.60561 18.8569 8.34325 18.8569C7.08088 18.8569 6.05753 17.8335 6.05753 16.5711C6.05753 15.3088 7.08088 14.2854 8.34325 14.2854C9.60561 14.2854 10.629 15.3088 10.629 16.5711ZM20.229 16.5711C20.229 17.8335 19.2056 18.8569 17.9432 18.8569C16.6809 18.8569 15.6575 17.8335 15.6575 16.5711C15.6575 15.3088 16.6809 14.2854 17.9432 14.2854C19.2056 14.2854 20.229 15.3088 20.229 16.5711Z" stroke="black" strokeWidth={2} strokeLinecap="round" />
                            </svg>免費送貨及退貨服務</p>
                            <p className="mb-3"><svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none">
                                <path d="M6.5998 8.80039V7.8861C6.5998 4.84719 9.00838 2.40039 11.9998 2.40039C14.9912 2.40039 17.3998 4.84719 17.3998 7.8861V8.80039M6.5998 8.80039C5.6098 8.80039 4.7998 9.62325 4.7998 10.629V19.7718C4.7998 20.7775 5.6098 21.6004 6.5998 21.6004H17.3998C18.3898 21.6004 19.1998 20.7775 19.1998 19.7718V10.629C19.1998 9.62325 18.3898 8.80039 17.3998 8.80039M6.5998 8.80039H17.3998" stroke="black" strokeWidth={2} strokeLinecap="round" />
                            </svg>安全付款</p>
                            <p><svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none">
                                <path d="M16.8002 8.40039L9.64068 15.6004L7.2002 13.1461" stroke="black" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>原廠保固</p>
                        </div>
                    </div>
                </div>
                {/* <div className="pProductBox d-flex flex-column align-items-center">
                    <p className="j-popularTitle j-publicFont">熱門產品</p>
                    <div className="j-popularProduct d-sm-flex justify-content-center d-none">
                        <div className="product1 d-flex flex-column me-5 pe-5">
                            <img src="/images/cart/canon-1.png" alt="" />
                            <p className="p1">Canon EOS R10</p>
                            <p className="p2">NT$67,500</p>
                        </div>
                        <div className="product2 d-flex flex-column me-5 pe-5">
                            <img src="/images/cart/canon-2.png" alt="" />
                            <p className="p1">Canon EOS R10</p>
                            <p className="p2">NT$67,500</p>
                        </div>
                        <div className="product3 d-flex flex-column me-5 pe-5">
                            <img src="/images/cart/canon-3.png" alt="" />
                            <p className="p1">Canon EOS R10</p>
                            <p className="p2">NT$67,500</p>
                        </div>
                        <div className="product4 d-flex flex-column">
                            <img src="/images/cart/canon-4.png" alt="" />
                            <p className="p1">Canon EOS R10</p>
                            <p className="p2">NT$67,500</p>
                        </div>
                    </div>
                    <div className="j-popularProduct d-flex justify-content-center d-sm-none">
                        <div className="product1 d-flex flex-column me-5">
                            <img src="/images/cart/canon-1.png" alt="" />
                            <p className="p1">Canon EOS R10</p>
                            <p className="p2">NT$67,500</p>
                        </div>
                        <div className="product2 d-flex flex-column">
                            <img src="/images/cart/canon-2.png" alt="" />
                            <p className="p1">Canon EOS R10</p>
                            <p className="p2">NT$67,500</p>
                        </div>
                    </div>
                </div> */}
            </div> : redirect('/cart')}
             
        </>
    )
}