import mongoose, { Types, Model } from 'mongoose';

interface IConversation {
  members: Types.DocumentArray<Types.ObjectId>;
}

const conversationSchema = new mongoose.Schema<
  IConversation,
  Model<IConversation>
>(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true
    },
    toObject: {
      virtuals: true
    }
  }
);

conversationSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'members',
    select:
      '-__v -passwordConfirm -following -followers -photos -location -birthYear -coverPic'
  });
  next();
});

const Conversation = mongoose.model<IConversation, Model<IConversation>>(
  'Conversation',
  conversationSchema
);

export default Conversation;
