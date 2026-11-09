const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../prisma');

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const { password: _pwd, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const me = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/google — exchange a Supabase Google session for the app JWT.
const googleAuth = async (req, res, next) => {
  try {
    const { access_token: accessToken } = req.body;
    const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return res.status(503).json({ message: 'Google sign-in is not configured on the server' });

    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return res.status(401).json({ message: 'Google sign-in session is invalid or expired' });
    const supabaseUser = await response.json();
    const email = supabaseUser.email?.trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Google did not provide an email address' });

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const metadata = supabaseUser.user_metadata || {};
      const name = (metadata.full_name || metadata.name || email.split('@')[0]).trim();
      const password = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);
      user = await prisma.user.create({ data: { name: name || 'Google user', email, password } });
    }

    const { password: _password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token: generateToken(user) });
  } catch (error) { next(error); }
};

module.exports = { register, login, me, googleAuth };
