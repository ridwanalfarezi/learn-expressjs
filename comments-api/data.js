let users = [
  {
    id: 1,
    username: "johndoe",
    comments: [],
  },
  {
    id: 2,
    username: "janedoe",
    comments: [],
  },
];

let comments = [
  {
    id: 1,
    userId: 1,
    text: "This is johndoe comment",
  },
  {
    id: 2,
    userId: 1,
    text: "This is johndoe another comment",
  },
  {
    id: 3,
    userId: 2,
    text: "This is janedoe comment",
  },
  {
    id: 4,
    userId: 2,
    text: "This is another janedoe comment",
  },
];

users = users.map((user) => {
  return {
    ...user,
    comments: comments.filter((comment) => comment.userId == user.id),
  };
});
  
export { comments, users };