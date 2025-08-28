// 通知服務 - 使用 SweetAlert2 風格的通知
export const notification = {
  // 成功通知
  success: (message, title = '成功') => {
    // 創建自定義通知元素
    showNotification(message, title, 'success')
  },

  // 錯誤通知
  error: (message, title = '錯誤') => {
    showNotification(message, title, 'error')
  },

  // 警告通知
  warning: (message, title = '警告') => {
    showNotification(message, title, 'warning')
  },

  // 資訊通知
  info: (message, title = '提示') => {
    showNotification(message, title, 'info')
  }
}

// 顯示通知的核心函數
function showNotification(message, title, type) {
  // 移除現有的通知
  const existingNotification = document.querySelector('.custom-notification')
  if (existingNotification) {
    existingNotification.remove()
  }

  // 創建通知元素
  const notification = document.createElement('div')
  notification.className = `custom-notification custom-notification--${type}`
  
  // 設定圖示
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }

  notification.innerHTML = `
    <div class="custom-notification__content">
      <div class="custom-notification__icon">${icons[type]}</div>
      <div class="custom-notification__text">
        <div class="custom-notification__title">${title}</div>
        <div class="custom-notification__message">${message}</div>
      </div>
      <button class="custom-notification__close">×</button>
    </div>
  `

  // 添加樣式
  const style = document.createElement('style')
  style.textContent = `
    .custom-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      min-width: 300px;
      max-width: 500px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      animation: slideInRight 0.3s ease-out;
      font-family: 'Noto Sans TC', sans-serif;
    }

    .custom-notification--success {
      border-left: 4px solid #28a745;
    }

    .custom-notification--error {
      border-left: 4px solid #dc3545;
    }

    .custom-notification--warning {
      border-left: 4px solid #ffc107;
    }

    .custom-notification--info {
      border-left: 4px solid #17a2b8;
    }

    .custom-notification__content {
      display: flex;
      align-items: flex-start;
      padding: 16px;
      gap: 12px;
    }

    .custom-notification__icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      color: white;
      flex-shrink: 0;
    }

    .custom-notification--success .custom-notification__icon {
      background: #28a745;
    }

    .custom-notification--error .custom-notification__icon {
      background: #dc3545;
    }

    .custom-notification--warning .custom-notification__icon {
      background: #ffc107;
      color: #333;
    }

    .custom-notification--info .custom-notification__icon {
      background: #17a2b8;
    }

    .custom-notification__text {
      flex: 1;
    }

    .custom-notification__title {
      font-weight: bold;
      font-size: 14px;
      color: #333;
      margin-bottom: 4px;
    }

    .custom-notification__message {
      font-size: 13px;
      color: #666;
      line-height: 1.4;
    }

    .custom-notification__close {
      background: none;
      border: none;
      font-size: 18px;
      color: #999;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .custom-notification__close:hover {
      color: #333;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    .custom-notification--closing {
      animation: slideOutRight 0.3s ease-in forwards;
    }

    @media (max-width: 576px) {
      .custom-notification {
        left: 20px;
        right: 20px;
        min-width: auto;
        max-width: none;
      }
    }
  `

  // 添加樣式到頁面（如果還沒有的話）
  if (!document.querySelector('#custom-notification-styles')) {
    style.id = 'custom-notification-styles'
    document.head.appendChild(style)
  }

  // 添加通知到頁面
  document.body.appendChild(notification)

  // 添加關閉按鈕事件
  const closeBtn = notification.querySelector('.custom-notification__close')
  closeBtn.addEventListener('click', () => {
    closeNotification(notification)
  })

  // 自動關閉（5秒後）
  setTimeout(() => {
    if (document.body.contains(notification)) {
      closeNotification(notification)
    }
  }, 5000)
}

// 關閉通知
function closeNotification(notification) {
  notification.classList.add('custom-notification--closing')
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.remove()
    }
  }, 300)
}

export default notification
