const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getDb } = require("../conn");
const OpenAI = require("openai");
const { ObjectId } = require("mongodb");

const checkPassword = (password, passwordHash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, passwordHash, (err, same) => {
      if (err) {
        reject(err);
      }
      resolve(same);
    });
  });
};

const responseSender = (code, message, res) =>
  res.status(code).json({ msg: message });

const verifyToken = (token) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) return reject(err);
      resolve(payload);
    });
  });

const addMessage = async (message, chatId) => {
  try {
    const update = await getDb()
      .collection("chats")
      .updateOne({ _id: ObjectId(chatId) }, { $push: { messages: message } });
  } catch (e) {
    console.log(e);
    return { error: "error" };
  }
};

const generateResponse = async (message, id) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  addMessage(response.choices[0].message.content, id);
  return response.choices[0].message.content;
};

module.exports = {
  checkPassword,
  responseSender,
  verifyToken,
  addMessage,
  generateResponse,
};
