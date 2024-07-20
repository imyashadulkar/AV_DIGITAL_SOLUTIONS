export const successResponse = async (req, res, next) => {
  try {
    return res.status(req.data?.statuscode).json({
      statuscode: req.data.statuscode,
      success: true,
      message: req.data.responseMessage,
      data: req.data.responseData,
    });
  } catch (err) {
    next(err);
  }
};
