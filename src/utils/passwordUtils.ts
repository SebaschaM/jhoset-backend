import bcrypt from "bcrypt";

export async function encryptPassword(password: string): Promise<string> {
  const saltRounds = 10; // Número de rondas de sal. Un número mayor es más seguro, pero también más lento.
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
}
