import express from 'express';
import { verifyResetToken, resetPassword } from '../controllers/forgotpassword';
import {
  generateResetPasswordForm,
  generateErrorPage,
  generateTokenMissingPage,
  generateServerErrorPage,
  generatePasswordResetSuccessPage,
} from '../utils/htmlTemplates';

// Using any to bypass TS overload issues for cleaner routing setup
const router: any = express.Router();

router.get('/', async (req: any, res: any) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.status(400).send(generateTokenMissingPage());
    }

    try {
      await verifyResetToken(token);
      const html = generateResetPasswordForm(token);
      res.send(html);
    } catch (err: any) {
      res.status(400).send(generateErrorPage(err.message));
    }
  } catch (err: any) {
    console.error('Reset password page error:', err);
    res.status(500).send(generateServerErrorPage());
  }
});

// Handle reset password submission
// Handle reset password submission
router.post('/', async (req: any, res: any) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res
        .status(400)
        .send(generateErrorPage('Token และรหัสผ่านใหม่จำเป็นต้องระบุ'));
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .send(generateErrorPage('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'));
    }

    try {
      await resetPassword(token, newPassword);
      res.send(generatePasswordResetSuccessPage());
    } catch (err: any) {
      res.status(400).send(generateErrorPage(err.message));
    }
  } catch (err: any) {
    console.error('Reset password submission error:', err);
    res.status(500).send(generateServerErrorPage());
  }
});

export default router;
