import { Token } from "@prisma/client";
import { DatabaseError, NotFoundError } from "../utils/errors";
import prisma from "../utils/prismaClient";

export interface CreateTokenInput {
  userId: string;
  token: string;
}

/**
 * Token Repository - Handles all token data access operations
 */
export class TokenRepository {
  /**
   * Find a token by user ID
   */
  async findByUserId(userId: string): Promise<Token | null> {
    try {
      return await prisma.token.findUnique({
        where: { userId },
      });
    } catch (error) {
      throw new DatabaseError("Failed to find token", error);
    }
  }

  /**
   * Find a token by token value
   */
  async findByToken(token: string): Promise<Token | null> {
    try {
      return await prisma.token.findUnique({
        where: { token },
      });
    } catch (error) {
      throw new DatabaseError("Failed to find token", error);
    }
  }

  /**
   * Create a new token
   */
  async create(input: CreateTokenInput): Promise<Token> {
    try {
      return await prisma.token.create({
        data: {
          userId: input.userId,
          token: input.token,
        },
      });
    } catch (error) {
      if ((error as any).code === "P2002") {
        throw new DatabaseError("Token already exists for this user", error);
      }
      if ((error as any).code === "P2003") {
        throw new DatabaseError("Invalid user reference", error);
      }
      throw new DatabaseError("Failed to create token", error);
    }
  }

  /**
   * Update a token
   */
  async update(userId: string, newToken: string): Promise<Token> {
    try {
      return await prisma.token.update({
        where: { userId },
        data: { token: newToken },
      });
    } catch (error) {
      if ((error as any).code === "P2025") {
        throw new NotFoundError("Token not found for user", "Token", userId);
      }
      throw new DatabaseError("Failed to update token", error);
    }
  }

  /**
   * Delete a token
   */
  async delete(userId: string): Promise<Token> {
    try {
      return await prisma.token.delete({
        where: { userId },
      });
    } catch (error) {
      if ((error as any).code === "P2025") {
        throw new NotFoundError("Token not found for user", "Token", userId);
      }
      throw new DatabaseError("Failed to delete token", error);
    }
  }

  /**
   * Check if token exists
   */
  async exists(userId: string): Promise<boolean> {
    try {
      const token = await prisma.token.findUnique({
        where: { userId },
        select: { id: true },
      });
      return !!token;
    } catch (error) {
      throw new DatabaseError("Failed to check token existence", error);
    }
  }
}

export const tokenRepository = new TokenRepository();
