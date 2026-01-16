const errorHandler = (err, req, res, next) => {
  // Detailed logging for debugging
  console.error("=== ERROR DETAILS ===");
  console.error("Error Name:", err.name);
  console.error("Error Message:", err.message);
  console.error("Error Code:", err.code);
  console.error("Error Stack:", err.stack);
  console.error("Request URL:", req.url);
  console.error("Request Method:", req.method);
  console.error("===================");

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      errors: err.errors,
    });
  }

  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      message: "Duplicate entry",
      error: "A record with this information already exists",
    });
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
