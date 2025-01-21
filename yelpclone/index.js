import flash from "connect-flash";
import ejsMate from "ejs-mate";
import express from "express";
import session from "express-session";
import methodOverride from "method-override";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import { initializePassport } from "./config/passport.js";
import { authRouter } from "./routes/auth.js";
import { placeRouter } from "./routes/place.js";
import { reviewRouter } from "./routes/review.js";
import ErrorHandler from "./utils/ErrorHandler.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
app.use(flash());

initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/", (req, res) => {
  res.render("home");
});

app.use("/", authRouter);
app.use("/places", placeRouter);
app.use("/places/:placeId/reviews", reviewRouter);

app.all("*", (req, res, next) => {
  next(new ErrorHandler("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong";
  res.status(statusCode).render("error", { err });
});

app.listen(3333, () => {
  console.log("Server is running on http://localhost:3333");
});
