const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/movie_db")
  .then(() => {
    console.log("connected");
  })
  .catch((err) => {
    console.log(err);
  });

const movieSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  year: Number,
  director: String,
  genre: String,
});

const Movie = mongoose.model("Movie", movieSchema);

// Movie.insertMany([
//   {
//     name: "The Shawshank Redemption",
//     rating: 9.3,
//     year: 1994,
//     director: "Frank Darabont",
//     genre: "Drama",
//   },
//   {
//     name: "The Godfather",
//     rating: 9.2,
//     year: 1972,
//     director: "Francis Ford Coppola",
//     genre: "Crime",
//   },
//   {
//     name: "The Dark Knight",
//     rating: 9.0,
//     year: 2008,
//     director: "Christopher Nolan",
//     genre: "Action",
//   },
// ])
//   .then((movies) => {
//     console.log("Movies added");
//     console.log(movies);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// Movie.find({ year: { $lt: 2000 }, genre: "Drama" })
//   .then((movies) => {
//     console.log(movies);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

//   Movie.findById("67a952e9de36bc4885814233").then((movie) => {
//     console.log(movie);
//   })

Movie.updateMany({ year: { $lt: 2000 } }, { $set: { genre: "Classic" } })
  .then((movies) => {
    console.log("Movies updated");
    console.log(movies);
  })
  .catch((err) => {
    console.log(err);
  });
