import { prisma } from "../prisma/prisma.js";

async function getUsers() {
  const result = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      comments: {
        select: {
          id: true,
          text: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  if (result.length === 0) {
    return { message: "No users found" };
  }

  return result;
}

async function getUserById(userId) {
  const result = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: {
      id: true,
      username: true,
      comments: {
        select: {
          id: true,
          text: true,
        },
      },
    },
  });

  if (!result) {
    return { message: "User not found" };
  }

  return result;
}

async function updateUser(userId, username) {
  const result = await prisma.user.update({
    where: { id: Number(userId) },
    data: { username },
  });

  if (!result) {
    return { message: "Error updating user" };
  }

  return { message: "User updated successfully" };
}

async function deleteUser(userId) {
  const result = await prisma.user.delete({
    where: { id: Number(userId) },
  });

  if (!result) {
    return { message: "Error deleting user" };
  }

  return { message: "User deleted successfully" };
}

export { deleteUser, getUserById, getUsers, updateUser };
