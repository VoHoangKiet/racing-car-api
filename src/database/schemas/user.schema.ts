import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document & { _id: string };

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop({ select: false })
  password?: string;

  @Prop({ required: true, default: 'ACTIVE' })
  status: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop()
  address?: string;

  @Prop()
  identityId?: string;

  @Prop({ select: false })
  refreshToken?: string;

  @Prop()
  avatar?: string;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};
