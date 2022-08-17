import mongoose, { Types, Model, Schema } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { IPost } from './postModel';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  firstName: mongoose.Schema.Types.String;
  lastName: Schema.Types.String;
  email: Schema.Types.String;
  password: string | Promise<string> | undefined;
  passwordConfirm: Schema.Types.String | undefined;
  profilePic: Schema.Types.String;
  coverPic: Schema.Types.String;
  photos: Types.Array<string>;
  followers: Types.DocumentArray<IUser>;
  following: Types.DocumentArray<IUser>;
  location: {
    type: string;
    coordinates: Types.Array<number>;
    city: string;
    state: string;
  };
  birthYear: Schema.Types.Number;
  catchPhrase: string;
}

interface IUserMethods {
  verifyPassword(candidatePass: string, userPass: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser, Model<IUser>, IUserMethods>(
  {
    firstName: {
      type: String,
      minlength: [2, 'The first name must be at least 2 characters'],
      required: true
    },
    lastName: {
      type: String,
      minlength: [2, 'The last name must be at least 2 characters'],
      required: true
    },
    email: {
      type: String,
      required: [true, 'A user must have an email'],
      trim: true,
      validate: {
        validator: validator.isEmail,
        message:
          'Email format must match test@example.com. {VALUE} is an invalid email'
      },
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true, 'A password is required'],
      minlength: [8, 'A password must be at least 8 characters'],
      select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (password: string) {
          return (this as any).password === password;
        }
      }
    },

    profilePic: {
      type: String,
      default: 'default.jpg'
    },
    coverPic: {
      type: String,
      default: 'default.jpg'
    },
    photos: {
      type: [String]
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number]
      },
      city: {
        type: String
      },
      state: {
        type: String
      }
    },
    birthYear: {
      type: Number
    },
    catchPhrase: {
      type: String,
      minlength: [1, 'A catch phrase must be at least 1 character'],
      maxlength: [150, 'A catch phrase cannot be longer than 150 characters'],
      trim: true,
      default: 'Say Something Clever'
    }
  },
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);

userSchema.virtual('posts', {
  ref: 'Post',
  foreignField: 'toUser',
  localField: '_id'
});

userSchema.virtual('posts', {
  ref: 'Post',
  foreignField: 'fromUser',
  localField: '_id'
});

userSchema.index({ location: '2dsphere' });

userSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password as string, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.verifyPassword = async function (candidatePass, userPass) {
  return await bcrypt.compare(candidatePass, userPass);
};

const User = mongoose.model<IUser, Model<IUser, {}, IUserMethods>>(
  'User',
  userSchema
);

export default User;
