import { body } from "express-validator";

export const forgotPasswordValidator = [
  body("email").trim().isEmail().withMessage("Adresse e-mail invalide.").normalizeEmail(),
] as const;

export const resetPasswordValidator = [
  body("token").trim().notEmpty().withMessage("Jeton de réinitialisation requis."),
  body("password")
    .isString()
    .isLength({ min: 8, max: 128 })
    .withMessage("Le mot de passe doit contenir entre 8 et 128 caractères."),
] as const;
