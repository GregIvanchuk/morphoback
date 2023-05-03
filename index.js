import express from "express";
import mongoose from "mongoose";
import {registerValidation,loginValidation,createPostsValidation, } from "./validations.js"
import checkAuth from "./utils/checkAuth.js"
import *as UserController  from "./controllers/UserController.js"
import *as PostController  from "./controllers/PostController.js"
import *as mainPageController  from "./controllers/mainPageController.js"
import cors from "cors";
import multer from "multer";
import handleValidationErrors from "./utils/handleValidationErrors.js";
import TelegramBot from "node-telegram-bot-api"
import dotenv from 'dotenv';
mongoose.connect("mongodb+srv://gregiv99:dinamo333@cluster0.qsmamz1.mongodb.net/blog?retryWrites=true&w=majority")
.then(() => console.log("db Ok"))
.catch((err) => console.log("db error" ,err))
dotenv.config();
 const  app = express();
 const storage = multer.diskStorage({
    destination:(_, __, cb) => {
        cb(null,"uploads");
    },
    filename:(_, file, cb) => {
        cb(null, file.originalname);
    },
 })

 const upload = multer({storage})
 app.use(express.json());
 app.use(cors());
 "============================================================="
 const botToken =  process.env.TELEGRAM_BOT_TOKEN;
 const bot = new TelegramBot(botToken, { polling: true });
 app.use(express.urlencoded({ extended: true }));

 function sendTelegramMessage(chatId, message) {
    bot.sendMessage(chatId, message);
  }
  app.post('/form', (req, res) => {
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const { name, email, phone, details, letter } = req.body;
    const telegramMessage = `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nMesssage: ${letter}\nDetails: ${details}`;
  
    sendTelegramMessage(chatId, telegramMessage);
    res.send('Form submitted successfully!');
  });
  app.post('/form2', (req, res) => {
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const { fullName, phone, city, items, totalCount, cartTotalPrice } = req.body;
  
    let itemsText = '';
    for (let i = 0; i < items.length; i++) {
      const { title, price, count } = items[i];
      itemsText += `${title} x ${count} - ${price} грн\n`;
    }
  
    const telegramMessage = `Name: ${fullName}\nPhone: ${phone}\nCity: ${city}\n\n${itemsText}\nTotalCount: ${totalCount}\nTotalPrice: ${cartTotalPrice}`;
    sendTelegramMessage(chatId, telegramMessage);
    res.send('Form submitted successfully!');
  });



 app.use("/uploads", express.static("uploads"));

 app.post("/upload",checkAuth,  upload.single('image'), (req,res) => {
    res.json({
        url:`/uploads/${req.file.originalname}`
    })
 } )

 app.get("/mainPage", mainPageController.getAll);
 app.patch("/mainPage/:id",checkAuth, mainPageController.update);

app.post("/auth/register",registerValidation,handleValidationErrors, UserController.register );

app.post("/auth/login",loginValidation,handleValidationErrors, UserController.login )

app.get("/auth/me",  checkAuth ,UserController.getMe )
 
app.get("/posts",PostController.getAll);
app.get("/posts/:id",PostController.getOne);
app.post("/posts",checkAuth, createPostsValidation,handleValidationErrors, PostController.create);
app.delete("/posts/:id",checkAuth, PostController.remove);
app.patch("/posts/:id",checkAuth,handleValidationErrors, PostController.update);

 app.listen(4444, (err) =>{
    if (err) {
        return console.log(err);
    }
    console.log("server work!")
 });