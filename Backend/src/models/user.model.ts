import bcrypt from "bcryptjs";
import mongoose, { type HydratedDocument, type Model } from "mongoose";

export interface UserRecord {
  name: string;
  email: string;
  password?: string;
  avatar: string;
}

interface UserMethods {
  comparePassword(password: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<UserRecord, UserMethods>;

const userSchema = new mongoose.Schema<
  UserRecord,
  Model<UserRecord, object, UserMethods>,
  UserMethods
>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  avatar: {
    type: String,
    default: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp",
  },
});

userSchema.methods.comparePassword = function (password: string) {
  return bcrypt.compare(password, this.password ?? "");
};

userSchema.set("toJSON", {
  transform: (_doc, result) => {
    delete result.password;
    return result;
  },
});

userSchema.pre("save", async function () {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

const User = mongoose.model<UserRecord, Model<UserRecord, object, UserMethods>>(
  "User",
  userSchema,
);

export default User;
