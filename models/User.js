const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre completo es requerido'],
      trim: true
    },
    lastname: {
      type: String,
      required: [true, 'El apellido es requerido'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'El correo electrónico es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Por favor proporcione un correo electrónico válido']
    },
    passwordHash: {
      type: String,
      required: [true, 'La contraseña es requerida']
    },
    role: {
      type: String,
      enum: ['admin', 'vendedor', 'cliente'],
      default: 'cliente',
      index: true
    },
    cedula: {
      type: String,
      trim: true,
      sparse: true,
      index: true
    },
    phone: {
      type: String,
      trim: true
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      }
    }
  }
);

// Method to verify passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Static helper to hash passwords
userSchema.statics.hashPassword = async function (plainPassword) {
  return bcrypt.hash(plainPassword, 10);
};

const User = mongoose.model('User', userSchema);

module.exports = User;