import jwt from "jsonwebtoken";

// const authenticate = (req, res, next) => {
//   const token = req.cookies.authToken;

//   if (!token) {
//     return res.status(403).json({ message: "Unauthorized" });
//   }

//   try {
//     const user = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = user; // Attach user info to request
//     console.log(req.user.username);
//     next();
//   } catch (err) {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };

// export default authenticate;

// Middleware to protect routes
const authenticate = (req, res, next) => {
  const token = req.cookies.authToken; // Get token from cookies
  console.log(token);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user info to the request object
    console.log(req.user, decoded, "check");
    next(); // Proceed to the next middleware or route
  } catch (err) {
    console.error("Authentication error:", err);
    res
      .status(403)
      .json({ message: "Unauthorized - Invalid or expired token" });
  }
};

export default authenticate;
