const router = require("express").Router();
const { checkPassword, responseSender } = require("../Utils/funcions");
const { getDb } = require("../conn");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.route("/signup").post(async (req, res) => {
  const { email, password, username } = req.body;
  try {
    const hash = await bcrypt.hash(password, 8);
    const save = await getDb().collection("users").insertOne({
      username: email,
      displayName: username,
      password: hash,
    });
    const id = new ObjectId();
    const chat = await getDb().collection("chats").insertOne({
      _id: id,
      creator: email,
      name: "Chat 1",
      messages: [],
    });
    console.log(1, save.insertedId);
    const token = jwt.sign({ id: save.insertedId }, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });
    console.log(2);
    res.json({ ...save, chatId: id, roomName: "Chat 1", token });
  } catch (e) {
    console.log(JSON.stringify(e));
    if (e.code === 11000) {
      responseSender(400, "You cannot use this email", res);
      return;
    }
    responseSender(500, "Error Ocurred", res);
  }
});

router.route("/login").post(async (req, res) => {
  const { email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 8);
    const [user] = await getDb()
      .collection("users")
      .find({ username: email })
      .toArray();
    if (user === undefined) throw { code: 401 };
    const CORRECTPASS = await checkPassword(password, user.password);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });
    res.json({ ...user, token });
  } catch (e) {
    console.log(JSON.stringify(e));
    if (e.code === 401) {
      responseSender(401, "Incorrect username or password", res);
      return;
    }

    responseSender(500, "error ocurred ", res);
  }
});

module.exports = router;
