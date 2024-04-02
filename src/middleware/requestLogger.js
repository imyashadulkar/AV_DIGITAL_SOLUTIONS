import logger from "../helpers/logger.js";

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { password, confirmPassword, newPassword, ...body } = req.body;
  const origin = req.get("Origin");
  res.on("finish", () => {
    const end = Date.now();
    const duration = end - start;
    const meta = {
      userId: req.body?.userId,
      subUserId: req.body?.subUserId,
      email: req.meta?.email,
      status: req.data?.statuscode || req.err?.statuscode,
      responseMessage: req.data?.responseMessage || req.err?.responseMessage,
      params:
        JSON.stringify(req.params) !== "{}" ? JSON.stringify(req.params) : null,
      body: JSON.stringify(body),
      timeTakenInMs: duration,
      controller: req.meta?.endpoint,
      path: req.originalUrl,
      method: req.method,
      responseDataSizeInKb: getObjectSizeInKB(req.data?.responseData),
      origin
    };
    logger.info(req.meta?.endpoint || "enpoint_not_added", meta);
  });
  next();
};
export default requestLogger;
