import { validateToken } from "../helpers/authHelper.js";

export const verifyToken = async (req, res, next) => {
  const token = req.cookies.jwt;
  const validToken = validateToken(token);
  if (validToken.success) {
    req.body = {
      ...req.body,
      ...validToken.data,
      isAdmin: validToken.data.isAdmin
    };
    req.data = {
      ...req.body,
      ...validToken.data,
      isAdmin: validToken.data.isAdmin
    };
    next();
  } else {
    res.status(401).json({
      success: false,
      error: validToken.error
    });
  }
};

export const verifyAdmin = async (req, res, next) => {
  const { isAdmin } = req.body;
  if (isAdmin) {
    next();
  } else {
    res.status(401).json({
      success: false,
      error: "You don't have permission to access this endpoint"
    });
  }
};
