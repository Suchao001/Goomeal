// Email verification success page
export const generateEmailVerificationSuccessPage = (username: string): string => {
    return `
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>GoodMeal - Email Verified Successfully</title>
                <style>
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        margin: 0; 
                        padding: 0; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .container { 
                        max-width: 500px; 
                        background: white; 
                        border-radius: 20px; 
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                        text-align: center;
                        overflow: hidden;
                        margin: 20px;
                    }
                    .header { 
                        background: linear-gradient(135deg, #4CAF50, #45a049); 
                        padding: 40px 30px; 
                        color: white;
                    }
                    .header h1 { 
                        margin: 0; 
                        font-size: 32px; 
                        font-weight: 700;
                        margin-bottom: 10px;
                    }
                    .header p {
                        margin: 0;
                        font-size: 18px;
                        opacity: 0.9;
                    }
                    .content { 
                        padding: 50px 30px; 
                    }
                    .success-icon {
                        font-size: 80px;
                        margin-bottom: 20px;
                        animation: bounce 1s ease-in-out;
                    }
                    @keyframes bounce {
                        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                        40% { transform: translateY(-10px); }
                        60% { transform: translateY(-5px); }
                    }
                    .success-message {
                        color: #2c3e50;
                        font-size: 24px;
                        font-weight: 600;
                        margin-bottom: 15px;
                    }
                    .welcome-text {
                        color: #5a6c7d;
                        font-size: 16px;
                        line-height: 1.6;
                        margin-bottom: 30px;
                    }
                    .username {
                        color: #4CAF50;
                        font-weight: bold;
                    }
                    .next-steps {
                        background: #f8f9fa;
                        padding: 25px;
                        border-radius: 10px;
                        margin: 30px 0;
                        text-align: left;
                    }
                    .next-steps h3 {
                        color: #2c3e50;
                        margin-top: 0;
                        margin-bottom: 20px;
                        text-align: center;
                        font-size: 18px;
                    }
                    .steps-list {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                        counter-reset: step-counter;
                    }
                    .steps-list li {
                        color: #5a6c7d;
                        padding: 10px 0;
                        position: relative;
                        padding-left: 40px;
                        counter-increment: step-counter;
                    }
                    .steps-list li::before {
                        content: counter(step-counter);
                        position: absolute;
                        left: 0;
                        top: 10px;
                        background: #4CAF50;
                        color: white;
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                        font-weight: bold;
                    }
                    .close-button {
                        background: linear-gradient(135deg, #4CAF50, #45a049);
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 50px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        margin-top: 20px;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
                    }
                    .close-button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
                    }
                    .footer {
                        color: #95a5a6;
                        font-size: 14px;
                        padding: 20px;
                        background: #f8f9fa;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🍽️ GoodMeal</h1>
                        <p>Email Verification Successful</p>
                    </div>
                    
                    <div class="content">
                        <div class="success-icon">✅</div>
                        
                        <div class="success-message">
                            ยืนยันอีเมลสำเร็จ!
                        </div>
                        
                        <div class="welcome-text">
                            ยินดีต้อนรับ <span class="username">${username}</span><br>
                            เข้าสู่ครอบครัว GoodMeal<br>
                            ตอนนี้คุณสามารถใช้งานแอปได้เต็มรูปแบบแล้ว
                        </div>
                        
                        <div class="next-steps">
                            <h3>🚀 ขั้นตอนถัดไป</h3>
                            <ol class="steps-list">
                                <li>เปิดแอป GoodMeal บนมือถือของคุณ</li>
                                <li>เข้าสู่ระบบด้วยบัญชีที่เพิ่งยืนยัน</li>
                                <li>กรอกข้อมูลส่วนตัวและเป้าหมาย</li>
                                <li>เริ่มต้นการเดินทางสู่สุขภาพที่ดี</li>
                            </ol>
                        </div>
                        
                        <button class="close-button" onclick="window.close()">
                            ปิดหน้าต่าง
                        </button>
                    </div>
                    
                    <div class="footer">
                        <p>ขอบคุณที่เลือกใช้ GoodMeal 💚</p>
                    </div>
                </div>
                
                <script>
                    // Auto close after 10 seconds if possible
                    setTimeout(() => {
                        try {
                            window.close();
                        } catch (e) {
                            // If can't close, show a message
                            console.log('Cannot auto close window');
                        }
                    }, 10000);
                </script>
            </body>
        </html>
    `;
};

// Email verification error page
export const generateEmailVerificationErrorPage = (errorMessage: string): string => {
    return `
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>GoodMeal - Email Verification Error</title>
                <style>
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        margin: 0; 
                        padding: 0; 
                        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .container { 
                        max-width: 500px; 
                        background: white; 
                        border-radius: 20px; 
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                        text-align: center;
                        overflow: hidden;
                        margin: 20px;
                    }
                    .header { 
                        background: linear-gradient(135deg, #e74c3c, #c0392b); 
                        padding: 40px 30px; 
                        color: white;
                    }
                    .header h1 { 
                        margin: 0; 
                        font-size: 32px; 
                        font-weight: 700;
                        margin-bottom: 10px;
                    }
                    .header p {
                        margin: 0;
                        font-size: 18px;
                        opacity: 0.9;
                    }
                    .content { 
                        padding: 50px 30px; 
                    }
                    .error-icon {
                        font-size: 80px;
                        margin-bottom: 20px;
                        animation: shake 0.5s ease-in-out;
                    }
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-5px); }
                        75% { transform: translateX(5px); }
                    }
                    .error-message {
                        color: #2c3e50;
                        font-size: 24px;
                        font-weight: 600;
                        margin-bottom: 15px;
                    }
                    .error-text {
                        color: #5a6c7d;
                        font-size: 16px;
                        line-height: 1.6;
                        margin-bottom: 30px;
                    }
                    .error-details {
                        background: #fff5f5;
                        border: 1px solid #feb2b2;
                        padding: 20px;
                        border-radius: 10px;
                        margin: 20px 0;
                        color: #c53030;
                    }
                    .actions {
                        margin: 30px 0;
                    }
                    .retry-button {
                        background: linear-gradient(135deg, #4CAF50, #45a049);
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 50px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                        margin: 10px;
                        text-decoration: none;
                        display: inline-block;
                        transition: all 0.3s ease;
                    }
                    .retry-button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
                    }
                    .close-button {
                        background: #95a5a6;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 50px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                        margin: 10px;
                        transition: all 0.3s ease;
                    }
                    .close-button:hover {
                        background: #7f8c8d;
                        transform: translateY(-2px);
                    }
                    .footer {
                        color: #95a5a6;
                        font-size: 14px;
                        padding: 20px;
                        background: #f8f9fa;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🍽️ GoodMeal</h1>
                        <p>Email Verification Failed</p>
                    </div>
                    
                    <div class="content">
                        <div class="error-icon">❌</div>
                        
                        <div class="error-message">
                            เกิดข้อผิดพลาด
                        </div>
                        
                        <div class="error-text">
                            ไม่สามารถยืนยันอีเมลได้<br>
                            กรุณาลองใหม่อีกครั้งหรือติดต่อทีมงาน
                        </div>
                        
                        <div class="error-details">
                            <strong>รายละเอียดข้อผิดพลาด:</strong><br>
                            ${errorMessage}
                        </div>
                        
                        <div class="actions">
                            <button class="retry-button" onclick="window.location.reload()">
                                ลองใหม่
                            </button>
                            <button class="close-button" onclick="window.close()">
                                ปิดหน้าต่าง
                            </button>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>หากปัญหายังคงอยู่ กรุณาติดต่อทีมงาน GoodMeal</p>
                    </div>
                </div>
            </body>
        </html>
    `;
};
