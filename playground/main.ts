import { AdminSchema, EmailSchema, PostSchema, UserSchema } from './schemas';

const email = EmailSchema.parse("test@email.com");
const user = UserSchema.parse({ name: "John", email: "john@example.com", role: "guest" });
const admin = AdminSchema.parse({ ...user, role: "admin", permissions: [] });
const post = PostSchema.parse({
  title: "Hello World",
  content: "This is a post",
  author: user,
  views: 100,
});

const data = { email, user, admin, post };

console.log("Parsed:", data);

document.getElementById("app")!.innerHTML = "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
