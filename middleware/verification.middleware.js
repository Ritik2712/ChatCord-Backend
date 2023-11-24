const { ObjectId } = require("mongodb");
const { responseSender, verifyToken } = require("../Utils/funcions");
const { getDb } = require("../conn");

const verifyUser = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    responseSender(400, "You are not authorized ", res);
    return;
  } else if (!authorization.startsWith("Bearer ")) {
    responseSender(400, "You are not authorized ", res);
    return;
  }

  try {
    const payload = await verifyToken(authorization.split(" ")[1]);
    if (payload) {
      const [user] = await getDb()
        .collection("users")
        .find({ _id: ObjectId(payload.id) }, { password: 0 })
        .toArray();
      if (user === undefined) {
        responseSender(404, "User not found", res);
        return;
      }
      req["user"] = user;

      next();
    } else {
      responseSender(400, "you are not authorized", res);
    }
  } catch (err) {
    console.log("Error ", err);
    responseSender(400, `Error ${err}`, res);
  }
};

module.exports = { verifyUser };
