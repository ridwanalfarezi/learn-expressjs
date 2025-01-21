import COMMENT_MESSAGES from "../messages/comments.js";
import { prisma } from "../prisma/prisma.js";

async function createComment(userId, text) {
  try {
    await prisma.comment.create({
      data: {
        userId: Number(userId),
        text,
      },
    });
    return { message: COMMENT_MESSAGES.CREATE_SUCCESS };
  } catch (error) {
    return { message: COMMENT_MESSAGES.CREATE_ERROR, error: error.message };
  }
}

async function updateComment(commentId, text) {
  try {
    await prisma.comment.update({
      where: {
        id: Number(commentId),
      },
      data: {
        text,
      },
    });
    return { message: COMMENT_MESSAGES.UPDATE_SUCCESS };
  } catch (error) {
    return { message: COMMENT_MESSAGES.UPDATE_ERROR, error: error.message };
  }
}

async function deleteComment(commentId) {
  try {
    await prisma.comment.delete({
      where: {
        id: Number(commentId),
      },
    });
    return { message: COMMENT_MESSAGES.DELETE_SUCCESS };
  } catch (error) {
    return { message: COMMENT_MESSAGES.DELETE_ERROR, error: error.message };
  }
}

export { createComment, deleteComment, updateComment };
