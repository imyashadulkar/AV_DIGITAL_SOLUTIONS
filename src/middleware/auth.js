import { validateToken } from "../helpers/authHelper.js";

export const verifyToken = async (req, res, next) => {
  console.log("Verifying token", req.cookies);
  const token = req.cookies.jwt;
  console.log({ token });
  const validToken = validateToken(token);
  console.log({ data: validToken.data });

  if (validToken.success) {
    req.body = {
      ...req.body,
      ...validToken.data,
      isAdmin: validToken.data.isAdmin,
      userRole: validToken.data.userRole,
      organizationId: validToken.data.organizationId,
      projectId: validToken.data.projectId,
    };
    req.data = {
      ...req.body,
      ...validToken.data,
      isAdmin: validToken.data.isAdmin,
      userRole: validToken.data.userRole,
      organizationId: validToken.data.organizationId,
      projectId: validToken.data.projectId,
    };
    next();
  } else {
    res.status(401).json({
      success: false,
      error: validToken.error,
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
      error: "You don't have permission to access this endpoint",
    });
  }
};
