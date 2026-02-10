/**
 * Auth controller: register and login.
 */
const jwt = require('jsonwebtoken');
const config = require('../config');
const userService = require('../services/userService');
const { success, error } = require('../utils/response');
const { required, oneOf } = require('../utils/validation');

async function register(req, res, next) {
  try {
    const err = required(req.body, ['email', 'password']);
    if (err) return error(res, err, 400);
    if (req.body.role != null && req.body.role !== '') {
      const roleErr = oneOf(req.body.role, ['FARMER', 'OPERATOR', 'ADMIN']);
      if (roleErr) return error(res, roleErr, 400);
    }

    const user = await userService.createUser({
      email: String(req.body.email || '').trim(),
      password: req.body.password,
      name: req.body.name != null ? String(req.body.name).trim() : undefined,
      role: req.body.role || 'FARMER',
    });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    return success(res, { user, token }, 201);
  } catch (e) {
    if (e.statusCode) return error(res, e.message, e.statusCode);
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const err = required(req.body, ['email', 'password']);
    if (err) return error(res, err, 400);

    const user = await userService.findByEmail(String(req.body.email || '').trim());
    if (!user) return error(res, 'Invalid email or password', 401);
    const valid = await userService.verifyPassword(user, req.body.password);
    if (!valid) return error(res, 'Invalid email or password', 401);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    return success(res, {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { register, login };
