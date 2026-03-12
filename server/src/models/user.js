import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          switch (this.role) {
            case 'alumni':
              return /^\d{11}$/.test(v);
            case 'admin':
            case 'coordinator':
              return /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9\-]+$/.test(v);
            default:
              return false;
          }
        },
        message: function () {
          if (this.role === 'alumni') {
            return 'Alumni userId must be exactly 11 digits';
          }
          return `${this.role} userId must be a mix of characters and numbers`;
        },
      },
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['alumni', 'admin', 'coordinator'],
    },
  },
  { timestamps: true }
);

const User = model('User', userSchema);

export default User;