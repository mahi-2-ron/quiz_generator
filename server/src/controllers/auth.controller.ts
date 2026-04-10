import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '30d',
  } as any);
};

export const signup = async (req: any, res: Response) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ success: false, message: 'User already exists' });
    return;
  }

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role || 'student',
  });

  if (user) {
    res.status(201).json({
      success: true,
      message: 'Signup successful',
      data: {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        accessToken: generateToken(user._id.toString()),
      },
    });
  } else {
    res.status(400).json({ success: false, message: 'Invalid user data' });
  }
};

export const login = async (req: any, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // Testing Mode Bypass: If there's no user, but environment is development, allow any login for testing
  const isTestingMode = process.env.NODE_ENV === 'development';
  let matchedUser = user;
  
  if (!user && isTestingMode) {
    matchedUser = new User({
      _id: '123456789012345678901234',
      name: 'Test Demo User',
      email: email,
      role: 'admin',
      passwordHash: 'dummy'
    }) as any;
  }

  // Normal auth flow
  const isValidPassword = (matchedUser === user && user !== null)
    ? await bcrypt.compare(password, user.passwordHash)
    : true; // Bypass password check for fake user in dev mode

  if (matchedUser && isValidPassword) {
    if (matchedUser === user && user !== null) {
      user.lastLoginAt = new Date();
      await user.save();
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { _id: matchedUser._id, name: matchedUser.name, email: matchedUser.email, role: matchedUser.role },
        accessToken: generateToken(matchedUser._id.toString()),
      },
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
};

export const getMe = async (req: any, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }
  const user = await User.findById(req.user._id).select('-passwordHash');
  if (user) {
    res.json({
      success: true,
      data: { user },
    });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
};
