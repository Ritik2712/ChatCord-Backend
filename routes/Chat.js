const router = require("express").Router();
const { responseSender } = require("../Utils/funcions");
const { getDb } = require("../conn");
const { ObjectId } = require("mongodb");
const { verifyUser } = require("../middleware/verification.middleware");

router.route("/add").post([verifyUser], async (req, res) => {
  const { number } = req.body;
  try {
    const id = new ObjectId();
    const newChat = {
      _id: id,
      creator: req.user.username,
      name: "Chat " + number,
      messages: [],
    };
    const save = await getDb().collection("chats").insertOne(newChat);
    res.json(newChat);
  } catch (e) {
    console.log(JSON.stringify(e));
    responseSender(500, "Error Ocurred", res);
  }
});

router.route("/get").get([verifyUser], async (req, res) => {
  const chats = await getDb()
    .collection("chats")
    .find({ creator: req.user.username })
    .toArray();
  res.json(chats);
});

router.route("/add").patch(async (req, res) => {
  const { chatId, message } = req.body;
  try {
    const update = await getDb()
      .collection("chats")
      .update(
        { _id: ObjectId(chatId) }, // Specify the document by its _id
        { $push: { messages: message } } // Use $push to add the new item to the 'items' array
      );
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
