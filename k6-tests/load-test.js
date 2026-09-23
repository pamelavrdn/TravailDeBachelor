import http from "k6/http";
import { check, sleep } from "k6";

const targetVUs = 100;

export let options = {
  stages: [
    { duration: "30s", target: targetVUs }, // Monte à x utilisateurs en 30 secondes
    { duration: "1m", target: targetVUs }, // Maintient x utilisateurs pendant 1 minute
    { duration: "30s", target: 0 }, // Redescend à 0 utilisateurs en 30 secondes
  ],
};

export default function () {
  const urls = [
    "http://localhost:3000/tb/men/categories/4/products",
    "http://localhost:3000/tb/women/categories/16/products",
    "http://localhost:3000/tb/men/categories/8/products",
    "http://localhost:3000/tb/men/categories/4/products?brand[]=ASOS+DESIGN&brand[]=Topman&sort=desc&limit=16&offset=16",
    "http://localhost:3000/tb/women/categories/16/products?color[]=Black&size[]=US+0&size[]=US+2&size[]=US+4&size[]=US+6&size[]=US+8&size[]=US+10&size[]=US+12&size[]=US+14&size[]=S&sort=asc&limit=16&offset=0",
  ];
  const res = http.get(urls[Math.floor(Math.random() * urls.length)]);

  check(res, {
    "is status 200": (r) => r.status === 200,
    "body size is correct": (r) => r.body && r.body.length > 0,
  });

  sleep(1);
}
