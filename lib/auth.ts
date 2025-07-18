import { jwt} from "jsonwebtoken"

/**
 * Genera un token JWT para un usuario
 * @param userId ID del usuario
 * @returns Token JWT
 */
export function generateToken(userId: string): string {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" })
  return token
}
