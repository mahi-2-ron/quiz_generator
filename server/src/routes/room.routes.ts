import { Router } from 'express';
import { createRoom, getRoomByCode, joinRoom, updateRoomStatus } from '../controllers/room.controller';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/:code', getRoomByCode);
router.post('/:code/join', joinRoom);

router.post('/', adminOnly, createRoom);
router.patch('/:roomId/status', adminOnly, updateRoomStatus);

export default router;
