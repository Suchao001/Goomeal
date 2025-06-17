import fs from 'fs';
import path from 'path';

// อ่านไฟล์ HTML template
export const readTemplate = (templateName: string): string => {
    try {
        const templatePath = path.join(__dirname, '../templates', templateName);
        return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
        console.error(`Error reading template ${templateName}:`, error);
        return '';
    }
};

// สร้าง HTML สำหรับฟอร์มรีเซ็ตรหัสผ่าน
export const generateResetPasswordForm = (token: string): string => {
    let template = readTemplate('reset-password.html');
    
    if (!template) {
        return getDefaultResetPasswordForm(token);
    }
    
    // แทนที่ token placeholder
    return template.replace('{{TOKEN}}', token);
};

// สร้าง HTML สำหรับหน้า error
export const generateErrorPage = (errorMessage: string): string => {
    let template = readTemplate('reset-password-error.html');
    
    if (!template) {
        return getDefaultErrorPage(errorMessage);
    }
    
    // แทนที่ error message placeholder
    return template.replace('{{ERROR_MESSAGE}}', errorMessage);
};

// Fallback HTML ในกรณีที่อ่านไฟล์ไม่ได้
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
