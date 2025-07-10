"use client";
import { gql, DocumentNode } from "@apollo/client";

export const GET_COUNTRY_CODE_QUERY: DocumentNode = gql`
  query getCountryCodeByIp {
    getCountryCodeByIp {
      countryCode
      countryName
    }
  }
`;

export const SIGNUP_MUTATION: DocumentNode = gql`
  mutation register($registerInput: RegisterDto!) {
    register(registerInput: $registerInput) {
      message
      user {
        id
        email
        username
        role
        isVerified
        googleId
      }
    }
  }
`;

export const VERIFY_USER_MUTATION: DocumentNode = gql`
  mutation verifyUser($verifyUserInput: VerifyUserDto!) {
    verifyUser(verifyUserInput: $verifyUserInput) {
      message
    }
  }
`;

export const RESEND_VERIFICATION_MUTATION: DocumentNode = gql`
  mutation resendVerification(
    $resendVerificationInput: ResendVerificationDto!
  ) {
    resendVerification(resendVerificationInput: $resendVerificationInput) {
      message
    }
  }
`;

export const LOGIN_MUTATION: DocumentNode = gql`
  mutation login($loginInput: LoginDto!) {
    login(loginInput: $loginInput) {
      message
      token
    }
  }
`;

export const GOOGLE_LOGIN_MUTATION: DocumentNode = gql`
  mutation googleLogin($googleLoginInput: GoogleLoginDto!) {
    googleLogin(googleLoginInput: $googleLoginInput) {
      message
      token
      user {
        id
        email
        username
        avatar
        role
        isVerified
        isOurUser
        googleId
      }
    }
  }
`;

export const CHECK_AUTH_QUERY: DocumentNode = gql`
  query checkAuth {
    checkAuth {
      id
      email
      role
      isVerified
      username
      avatar
      isOurUser
      googleId
    }
  }
`;

export const FORGOT_PASSWORD_MUTATION: DocumentNode = gql`
  mutation forgotPassword($forgotPasswordInput: ForgotPasswordDto!) {
    forgotPassword(forgotPasswordInput: $forgotPasswordInput) {
      message
    }
  }
`;

export const RESET_PASSWORD_MUTATION: DocumentNode = gql`
  mutation resetPassword($resetPasswordInput: ResetPasswordDto!) {
    resetPassword(resetPasswordInput: $resetPasswordInput) {
      message
    }
  }
`;

export const LOGOUT_MUTATION: DocumentNode = gql`
  mutation logout {
    logout
  }
`;
