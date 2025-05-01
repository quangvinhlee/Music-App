"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "app/store/store"; // Adjust the path to your store file
import { fetchUser, getGeoInfo } from "app/store/auth";

export default function AuthLoader() {
  const dispatch = useDispatch<AppDispatch>();

  const { countryCode } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchUser());
    }
  }, [dispatch]);

  if (!countryCode) {
    dispatch(getGeoInfo().then((res) => {
      if (res) 
    });
  }

  return null; // no UI, just auth logic
}
