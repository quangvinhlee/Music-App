"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUser } from "app/store/auth";

export default function AuthLoader() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchUser());
    }
  }, [dispatch]);

  return null; // no UI, just auth logic
}
