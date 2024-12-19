import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const jwtSecretKey = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, jwtSecretKey);

    req.user = decoded;
    console.log("JWT_SUCCESS =>", req.user);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Unauthorized: Token expired" });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    } else {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

export default verifyToken;

// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";

// dotenv.config();

// const jwtSecretKey = process.env.JWT_SECRET;

// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res
//       .status(401)
//       .json({ error: "Unauthorized: Missing or invalid token" });
//   }

//   const token = authHeader.split(" ")[1];

//   // Decode the token to check the expiration without verifying the signature
//   const decoded = jwt.decode(token);

//   if (!decoded || !decoded.exp) {
//     return res
//       .status(401)
//       .json({ error: "Unauthorized: Invalid token structure" });
//   }

//   const expirationTime = decoded.exp * 1000; // Convert `exp` from seconds to milliseconds
//   const currentTime = Date.now();

//   if (currentTime >= expirationTime) {
//     return res.status(401).json({ error: "Unauthorized: Token expired" });
//   }

//   // Token is not expired, so proceed with full verification
//   jwt.verify(token, jwtSecretKey, (err, verified) => {
//     if (err) {
//       return res.status(401).json({ error: "Unauthorized: Invalid token" });
//     }

//     req.user = verified;
//     // console.log("JWT_VERIFIED_at_", currentTime, req.user);
//     console.log("JWT_VERIFIED_at_", currentTime);
//     next();
//   });
// };

// export default verifyToken;

// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";

// dotenv.config();

// const jwtSecretKey = process.env.JWT_SECRET;

// const verifyToken = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res
//         .status(401)
//         .json({ error: "Unauthorized: Missing or invalid token" });
//     }

//     const token = authHeader.split(" ")[1];

//     const decoded = await jwt.verify(token, jwtSecretKey);

//     req.user = decoded;
//     console.log("JWT_SUCCESS =>", req.user);
//     next();
//   } catch (err) {
//     if (err.name === "TokenExpiredError") {
//       return res.status(401).json({ error: "Unauthorized: Token expired" });
//     } else if (err.name === "JsonWebTokenError") {
//       return res.status(401).json({ error: "Unauthorized: Invalid token" });
//     } else {
//       return res.status(500).json({ error: "Internal Server Error" });
//     }
//   }
// };

// export default verifyToken;
