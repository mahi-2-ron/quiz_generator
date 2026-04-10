import { Router } from 'express';
import { createRoom, getRoomByCode, joinRoom, updateRoomStatus } from '../controllers/room.controller';
import { protect, adminOnly } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createRoomSchema, updateRoomStatusSchema, joinRoomSchema } from '../schemas/room.schema';

const router = Router();

router.use(protect);

router.get('/:code', validate(joinRoomSchema), getRoomByCode);
router.post('/:code/join', validate(joinRoomSchema), joinRoom);

router.post('/', adminOnly, validate(createRoomSchema), createRoom);
router.patch('/:roomId/status', adminOnly, validate(updateRoomStatusSchema), updateRoomStatus);

export default router;
