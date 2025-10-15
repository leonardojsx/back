import jwt from 'jsonwebtoken'

class Authentication {
  generateToken(payload) {
    return jwt.sign(payload, process.env.SECRET_JWT, { expiresIn: '7d' });
  }
}

export default new Authentication()