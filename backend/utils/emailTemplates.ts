// Email verification HTML template
export const generateEmailVerificationTemplate = (username: string, verificationUrl: string): string => {
    return `
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>GoodMeal - Email Verification</title>
                <style>
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        margin: 0; 
                        padding: 0; 
                        background-color: #f4f7fa; 
                        line-height: 1.6;
                    }
                    .container { 
                        max-width: 600px; 
                        margin: 40px auto; 
                        background: white; 
                        border-radius: 12px; 
                        overflow: hidden;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    }
                    .header { 
                        background: linear-gradient(135deg, #4CAF50, #45a049); 
                        padding: 40px 30px; 
                        text-align: center; 
                    }
                    .header h1 { 
                        color: white; 
                        margin: 0; 
                        font-size: 28px; 
                        font-weight: 600;
                    }
                    .content { 
                        padding: 40px 30px; 
                    }
                    .welcome-section {
                        background: #f8f9fa;
                        padding: 25px;
                        border-radius: 8px;
                        margin-bottom: 30px;
                        border-left: 4px solid #4CAF50;
                    }
                    .welcome-section h2 {
                        color: #2c3e50;
                        margin-top: 0;
                        margin-bottom: 15px;
                        font-size: 24px;
                    }
                    .welcome-section p {
                        color: #5a6c7d;
                        margin: 0;
                    }
                    .verification-section {
                        text-align: center;
                        margin: 40px 0;
                    }
                    .verification-button {
                        display: inline-block;
                        background: linear-gradient(135deg, #4CAF50, #45a049);
                        color: white;
                        text-decoration: none;
                        padding: 16px 40px;
                        border-radius: 50px;
                        font-weight: bold;
                        font-size: 16px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
                        transition: all 0.3s ease;
                    }
                    .verification-button:hover {
                        box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
                        transform: translateY(-2px);
                    }
                    .info-box {
                        background: #fff3cd;
                        border: 1px solid #ffeaa7;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 30px 0;
                    }
                    .info-box p {
                        margin: 0;
                        color: #856404;
                    }
                    .features-section {
                        background: #f8f9fa;
                        padding: 25px;
                        border-radius: 8px;
                        margin: 30px 0;
                    }
                    .features-section h3 {
                        color: #2c3e50;
                        margin-top: 0;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    .features-list {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                    }
                    .features-list li {
                        color: #5a6c7d;
                        padding: 8px 0;
                        position: relative;
                        padding-left: 30px;
                    }
                    .features-list li::before {
                        content: "✅";
                        position: absolute;
                        left: 0;
                        top: 8px;
                    }
                    .footer {
                        background: #2c3e50;
                        color: #bdc3c7;
                        text-align: center;
                        padding: 30px;
                        font-size: 14px;
                    }
                    .footer p {
                        margin: 5px 0;
                    }
                    .alternative-link {
                        background: #ecf0f1;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        text-align: center;
                    }
                    .alternative-link p {
                        margin: 10px 0;
                        color: #5a6c7d;
                        font-size: 14px;
                    }
                    .alternative-link code {
                        background: #34495e;
                        color: #ecf0f1;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-family: 'Courier New', monospace;
                        word-break: break-all;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🍽️ GoodMeal</h1>
                    </div>
                    
                    <div class="content">
                        <div class="welcome-section">
                            <h2>ยินดีต้อนรับสู่ GoodMeal! 👋</h2>
                            <p>สวัสดี <strong>${username}</strong> ขอบคุณที่เลือกใช้ GoodMeal เพื่อดูแลสุขภาพและการกินของคุณ</p>
                        </div>
                        
                        <div class="verification-section">
                            <p style="color: #5a6c7d; margin-bottom: 25px; font-size: 16px;">
                                กรุณายืนยันอีเมลของคุณเพื่อเริ่มใช้งาน GoodMeal
                            </p>
                            <a href="${verificationUrl}" class="verification-button">
                                ยืนยันอีเมล
                            </a>
                        </div>
                        
                        <div class="info-box">
                            <p>
                                <strong>⚠️ สำคัญ:</strong> ลิงก์ยืนยันนี้จะหมดอายุใน 24 ชั่วโมง กรุณายืนยันอีเมลก่อนเวลาดังกล่าว
                            </p>
                        </div>
                        
                        <div class="features-section">
                            <h3>🎉 สิ่งที่คุณจะได้รับจาก GoodMeal</h3>
                            <ul class="features-list">
                                <li>วางแผนมื้ออาหารที่เหมาะสมกับคุณ</li>
                                <li>ติดตามแคลอรี่และโภชนาการ</li>
                                <li>แนะนำเมนูอาหารที่ดีต่อสุขภาพ</li>
                                <li>สร้างรายงานสุขภาพรายสัปดาห์</li>
                                <li>AI Assistant ที่คอยช่วยให้คำแนะนำ</li>
                            </ul>
                        </div>
                        
                       
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
                            <p style="margin: 0; color: #6c757d; font-size: 14px;">
                                หากคุณไม่ได้สมัครสมาชิก GoodMeal โปรดเพิกเฉยต่ออีเมลนี้
                            </p>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p><strong>GoodMeal Team</strong></p>
                        <p>Your Health, Our Priority</p>
                        <p style="font-size: 12px; opacity: 0.8;">
                            อีเมลนี้ส่งโดยระบบอัตโนมัติ โปรดอย่าตอบกลับ
                        </p>
                    </div>
                </div>
            </body>
        </html>
    `;
};

// Welcome email template (after email verification)
export const generateWelcomeEmailTemplate = (username: string): string => {
    return `
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>GoodMeal - Welcome!</title>
                <style>
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        margin: 0; 
                        padding: 0; 
                        background-color: #f4f7fa; 
                        line-height: 1.6;
                    }
                    .container { 
                        max-width: 600px; 
                        margin: 40px auto; 
                        background: white; 
                        border-radius: 12px; 
                        overflow: hidden;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    }
                    .header { 
                        background: linear-gradient(135deg, #4CAF50, #45a049); 
                        padding: 40px 30px; 
                        text-align: center; 
                    }
                    .header h1 { 
                        color: white; 
                        margin: 0; 
                        font-size: 28px; 
                        font-weight: 600;
                    }
                    .content { 
                        padding: 40px 30px; 
                    }
                    .success-section {
                        background: #d4edda;
                        border: 1px solid #c3e6cb;
                        padding: 25px;
                        border-radius: 8px;
                        margin-bottom: 30px;
                        text-align: center;
                    }
                    .success-section h2 {
                        color: #155724;
                        margin-top: 0;
                        margin-bottom: 15px;
                        font-size: 24px;
                    }
                    .success-section p {
                        color: #155724;
                        margin: 0;
                        font-size: 16px;
                    }
                    .next-steps {
                        background: #f8f9fa;
                        padding: 25px;
                        border-radius: 8px;
                        margin: 30px 0;
                    }
                    .next-steps h3 {
                        color: #2c3e50;
                        margin-top: 0;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    .steps-list {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                    }
                    .steps-list li {
                        color: #5a6c7d;
                        padding: 12px 0;
                        position: relative;
                        padding-left: 40px;
                        font-size: 16px;
                    }
                    .steps-list li::before {
                        content: counter(step-counter);
                        counter-increment: step-counter;
                        position: absolute;
                        left: 0;
                        top: 12px;
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
                    .steps-list {
                        counter-reset: step-counter;
                    }
                    .footer {
                        background: #2c3e50;
                        color: #bdc3c7;
                        text-align: center;
                        padding: 30px;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🍽️ GoodMeal</h1>
                    </div>
                    
                    <div class="content">
                        <div class="success-section">
                            <h2>🎉 ยืนยันอีเมลสำเร็จ!</h2>
                            <p>ยินดีต้อนรับ <strong>${username}</strong> เข้าสู่ครอบครัว GoodMeal</p>
                        </div>
                        
                        <div class="next-steps">
                            <h3>🚀 ขั้นตอนถัดไป</h3>
                            <ol class="steps-list">
                                <li>เข้าสู่ระบบด้วยบัญชีของคุณ</li>
                                <li>กรอกข้อมูลส่วนตัว (อายุ, น้ำหนัก, เป้าหมาย)</li>
                                <li>เลือกแผนการกินที่เหมาะกับคุณ</li>
                                <li>เริ่มต้นการเดินทางสู่สุขภาพที่ดีขึ้น</li>
                            </ol>
                        </div>
                        
                        <div style="background: #e8f5e8; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
                            <p style="margin: 0; color: #2e7d32; font-size: 16px;">
                                <strong>💡 เคล็ดลับ:</strong> เริ่มต้นด้วยการตั้งเป้าหมายที่เป็นไปได้ และค่อย ๆ ปรับปรุงไปเรื่อย ๆ
                            </p>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p><strong>GoodMeal Team</strong></p>
                        <p>Your Health, Our Priority</p>
                        <p style="font-size: 12px; opacity: 0.8;">
                            หากมีคำถาม กรุณาติดต่อทีมงาน GoodMeal
                        </p>
                    </div>
                </div>
            </body>
        </html>
    `;
};
