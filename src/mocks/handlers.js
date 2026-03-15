import { http, HttpResponse } from "msw";

let users = [
  {
    id: 1,
    name: "Admin",
    email: "admin@gmail.com",
    password: "123456"
  }
];

export const handlers = [

  // REGISTER
  http.post("/api/register", async ({ request }) => {

    const body = await request.json();

    const existingUser = users.find(
      (u) => u.email === body.email
    );

    if (existingUser) {
      return new HttpResponse(
        JSON.stringify({ message: "Email already exists" }),
        { status: 400 }
      );
    }

    const newUser = {
      id: users.length + 1,
      name: body.name,
      email: body.email,
      password: body.password
    };

    users.push(newUser);

    return HttpResponse.json({
      message: "Register successful",
      user: newUser
    });

  }),

  // LOGIN
  http.post("/api/login", async ({ request }) => {
    console.log("MSW LOGIN HIT");
    const body = await request.json();

    const user = users.find(
      (u) =>
        u.email === body.email &&
        u.password === body.password
    );

    if (!user) {
      return new HttpResponse(
        JSON.stringify({ message: "Invalid email or password" }),
        { status: 401 }
      );
    }

    return HttpResponse.json({
      token: "fake-jwt-token",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  })

];