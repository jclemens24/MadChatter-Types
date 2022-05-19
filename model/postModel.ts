import mongoose, { Types, Model, HydratedDocument } from 'mongoose';
import { IComment } from './commentsModel';

export interface IPost {
  toUser: Types.ObjectId;
  fromUser: Types.ObjectId;
  desc: string;
  image: string | null;
  likes: Types.DocumentArray<Types.ObjectId>;
}

export interface IPostVirtuals {
  comments: Types.DocumentArray<IComment>;
}

const postSchema = new mongoose.Schema<IPost, Model<IPost>>(
  {
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A post must be sent to a user']
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A post must be sent from a user']
    },
    desc: {
      type: String,
      maxlength: 500
    },
    image: {
      type: String,
      default: null
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: [],
        unique: false
      }
    ]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);

postSchema.pre(/^find/, async function (next) {
  this.populate([
    {
      path: 'toUser',
      select:
        '-__v -passwordConfirm -email -coverPic -followers -following -birthYear -photos -catchPhrase -location',
      options: { _recursed: true }
    },
    {
      path: 'fromUser',
      select:
        '-__v -passwordConfirm -email -coverPic -followers -following -birthYear -photos -catchPhrase -location'
    }
  ]);

  next();
});

postSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'post',
  localField: '_id'
});

postSchema.post('save', (doc: HydratedDocument<IPost>, next) => {
  doc
    .populate(['toUser', 'fromUser'])

    .then(() => {
      next();
    });
});

postSchema.post(/^create/, function (next) {
  this.populate({
    path: 'comments',
    options: {
      _recursed: true
    }
  });
  next();
});

const Post = mongoose.model<IPost, Model<IPost, {}, {}, IPostVirtuals>>(
  'Post',
  postSchema
);

export default Post;
