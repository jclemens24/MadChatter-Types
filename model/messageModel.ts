import mongoose, { Types, Model } from 'mongoose';

interface IMessage {
  conversationId: Types.ObjectId;
  sender: Types.ObjectId;
  text: string;
  read: boolean;
}

const messageSchema = new mongoose.Schema<IMessage>(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'A message must belong to a conversation']
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A message must belong to a user']
    },
    text: {
      type: String,
      trim: true,
      maxlength: [500, 'A message cannot be longer than 500 characters']
    },
    read: {
      type: Boolean,
      default: false
    }
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

messageSchema.pre(/^find/, async function (next) {
  this.populate(['conversationId', 'sender']);
  next();
});

const Message = mongoose.model<IMessage, Model<IMessage>>(
  'Message',
  messageSchema
);

export default Message;
