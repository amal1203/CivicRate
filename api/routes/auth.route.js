import express from 'express';
import { checkSignupAvailability, signin, signup } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/check-availability', checkSignupAvailability);
router.post('/signup', signup);
router.post('/signin', signin);



export default router;
