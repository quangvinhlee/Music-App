"use client";
import { gql, DocumentNode } from "@apollo/client";

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
      }
    }
  }
`;
