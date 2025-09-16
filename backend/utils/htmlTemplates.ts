import fs from 'fs';
import path from 'path';


export const readTemplate = (templateName: string): string => {
    try {
        const templatePath = path.join(__dirname, '../templates', templateName);
        return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
        console.error(`Error reading template ${templateName}:`, error);
        return '';
    }
};


export const generatePasswordResetSuccessPage = (): string => {
    let template = readTemplate('reset-password-success.html');
    if (!template) {
        return `
            <html>
                <head>
                    <title>GoodMeal - รีเซ็ตรหัสผ่านสำเร็จ</title>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
                        .success { color: #2e7d32; background: #e8f5e8; padding: 20px; border-radius: 8px; text-align: center; }
                        .button { background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <h1>🍽️ GoodMeal</h1>
                    <div class="success">
                        <h2>✅ รีเซ็ตรหัสผ่านสำเร็จ!</h2>
                        <p>รหัสผ่านของคุณได้รับการเปลี่ยนแปลงเรียบร้อยแล้ว</p>
                        <p>คุณสามารถใช้รหัสผ่านใหม่เพื่อเข้าสู่ระบบได้ทันที</p>
                        <a href="#" class="button" onclick="window.close()">ปิดหน้าต่าง</a>
                    </div>
                </body>
            </html>
        `;
    }
    return template;
};


export const generateResetPasswordForm = (token: string): string => {
    let template = readTemplate('reset-password.html');
    if (!template) {
        return getDefaultResetPasswordForm(token);
    }
    return template.replace('{{TOKEN}}', token);
};


export const generateErrorPage = (errorMessage: string): string => {
    let template = readTemplate('reset-password-error.html');
    if (!template) {
        return getDefaultErrorPage(errorMessage);
    }
    return template.replace('{{ERROR_MESSAGE}}', errorMessage);
};


export const generateTokenMissingPage = (): string => {
    return `
        <html>
            <head>
                <title>GoodMeal - Reset Password Error</title>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
                    .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 8px; }
                </style>
            </head>
            <body>
                <h1>🍽️ GoodMeal</h1>
                <div class="error">
                    <h2>ข้อผิดพลาด</h2>
                    <p>ไม่พบ token สำหรับรีเซ็ตรหัสผ่าน</p>
                </div>
            </body>
        </html>
    `;
};


export const generateServerErrorPage = (): string => {
    return `
        <html>
            <head>
                <title>GoodMeal - Server Error</title>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
                    .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 8px; }
                </style>
            </head>
            <body>
                <h1>🍽️ GoodMeal</h1>
                <div class="error">
                    <h2>เกิดข้อผิดพลาดของเซิร์ฟเวอร์</h2>
                    <p>กรุณาลองใหม่อีกครั้งในภายหลัง</p>
                </div>
            </body>
        </html>
    `;
};


const getDefaultResetPasswordForm = (token: string): string => {
    return `
        <html>
            <head>
                <title>GoodMeal - Reset Password</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
            </head>
            <body>
                <h1>🍽️ GoodMeal - Reset Password</h1>
                <form action="/user/reset-password" method="post">
                    <input type="hidden" name="token" value="${token}">
                    <label>New Password: <input type="password" name="newPassword" required></label><br>
                    <label>Confirm Password: <input type="password" name="confirmPassword" required></label><br>
                    <button type="submit">Reset Password</button>
                </form>
            </body>
        </html>
    `;
};

const getDefaultErrorPage = (errorMessage: string): string => {
    return `
        <html>
            <head>
                <title>GoodMeal - Error</title>
                <meta charset="utf-8">
            </head>
            <body>
                <h1>🍽️ GoodMeal</h1>
                <div style="color: red; background: #ffebee; padding: 20px;">
                    <h2>Error</h2>
                    <p>${errorMessage}</p>
                </div>
            </body>
        </html>
    `;
};
