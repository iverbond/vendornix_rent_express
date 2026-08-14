import { body } from "express-validator";

export const loginValidator = [
  body("email").trim().isEmail().withMessage("Adresse e-mail invalide.").normalizeEmail(),
  body("password").isString().notEmpty().withMessage("Mot de passe requis."),
] as const;

export const registerValidator = [
  body("firstName").trim().notEmpty().isLength({ max: 120 }),
  body("lastName").trim().notEmpty().isLength({ max: 120 }),
  body("email").trim().isEmail().withMessage("Adresse e-mail invalide.").normalizeEmail(),
  body("phone").optional({ nullable: true }).isString().isLength({ max: 40 }),
  body("password")
    .isString()
    .isLength({ min: 8, max: 128 })
    .withMessage("Le mot de passe doit contenir entre 8 et 128 caractères."),
] as const;

export const refreshValidator = [
  body("refreshToken").trim().notEmpty().withMessage("Jeton de rafraîchissement requis."),
] as const;

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
