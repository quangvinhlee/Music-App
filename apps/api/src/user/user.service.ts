/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResendVerificationDto,
  ResetPasswordDto,
  VerifyEmailDto,
  VerifyResetPasswordDto,
} from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { LoginResponse, RegisterResponse } from './types/user.type';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(
    registerDto: RegisterDto,
    res: any,
  ): Promise<RegisterResponse> {
    const { email, password, confirmPassword, username } = registerDto;

    if (!email || !password || !confirmPassword || !username) {
      return {
        message: 'All fields are required',
      };
    }

    if (password !== confirmPassword) {
      return {
        message: 'Passwords do not match',
      };
    }

    const existingEmailUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingEmailUser) {
      if (!existingEmailUser.isVerified) {
        await this.prisma.user.delete({
          where: { id: existingEmailUser.id },
        });
      } else {
        return {
          message: 'User with this email already exists',
        };
      }
    }

    const existingUsernameUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUsernameUser) {
      return {
        message: 'User with this username already exists',
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user in the database
    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword as string,
        username,
      },
    });

    const templatePath = 'src/mail/templates/verify-email.ejs';
    await this.generateVerificationCode(
      newUser.id,
      email,
      templatePath,
      username,
    );

    return {
      message: 'User created successfully',
      user: newUser,
    };
  }

  async login(loginDto: LoginDto, res: any): Promise<LoginResponse> {
    const { email, password } = loginDto;

    if (!email || !password) {
      throw new HttpException(
        'Email and password are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      throw new HttpException(
        'User with this email does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    // Compare the password with the hashed password
    const isPasswordMatch = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordMatch) {
      throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
    }

    const payload = {
      id: existingUser.id,
      username: existingUser.username,
      role: existingUser.role,
    };

    const token = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: '12h',
    });

    return {
      message: 'Login successful',
      token,
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { userId, verificationCode } = verifyEmailDto;

    if (!userId || !verificationCode) {
      throw new HttpException(
        'Email and verification code are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new HttpException(
        'User with this email does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    if (existingUser.isVerified) {
      throw new HttpException('Email already verified', HttpStatus.BAD_REQUEST);
    }

    if (existingUser.verificationCode !== verificationCode) {
      throw new HttpException(
        'Invalid verification code',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      !existingUser.verificationCodeExpiresAt ||
      existingUser.verificationCodeExpiresAt < new Date()
    ) {
      throw new HttpException(
        'Verification code expired',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.user.update({
      where: { id: existingUser.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    });

    return {
      message: 'Email verified successfully',
      user: existingUser,
    };
  }

  async resendVerification(resendVerificationDto: ResendVerificationDto) {
    const { userId, type } = resendVerificationDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.isVerified && type === 'register') {
      throw new HttpException('Email already verified', HttpStatus.BAD_REQUEST);
    }

    const templatePath =
      type === 'register'
        ? 'src/mail/templates/verify-email.ejs'
        : 'src/mail/templates/forgot-password.ejs';

    await this.generateVerificationCode(
      user.id,
      user.email,
      templatePath,
      user.username,
    );

    return {
      message: 'Verification code sent successfully',
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const templatePath = 'src/mail/templates/forgot-password.ejs';

    await this.generateVerificationCode(
      user.id,
      email,
      templatePath,
      user.username,
    );

    return {
      message: 'Verification code sent successfully',
    };
  }

  async verifyResetPassword(verifyResetPasswordDto: VerifyResetPasswordDto) {
    const { email, verificationCode } = verifyResetPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.verificationCode !== verificationCode) {
      throw new HttpException(
        'Invalid verification code',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      !user.verificationCodeExpiresAt ||
      user.verificationCodeExpiresAt < new Date()
    ) {
      throw new HttpException(
        'Verification code expired',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: 'Verification code verified successfully',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, verificationCode, password, confirmPassword } =
      resetPasswordDto;

    if (!email || !verificationCode || !password || !confirmPassword) {
      return {
        message: 'All fields are required',
      };
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        message: 'User not found',
      };
    }

    if (password !== confirmPassword) {
      return {
        message: 'Passwords do not match',
      };
    }

    if (user.verificationCode !== verificationCode) {
      return {
        message: 'Invalid verification code',
      };
    }

    if (
      !user.verificationCodeExpiresAt ||
      user.verificationCodeExpiresAt < new Date()
    ) {
      return {
        message: 'Verification code expired',
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword as string,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    });

    return {
      message: 'Password reset successfully',
    };
  }

  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, role: true },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async generateVerificationCode(
    userId: string,
    email: string,
    templatePath: string,
    username: string,
  ) {
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const verificationCodeExpiresAt = new Date();
    verificationCodeExpiresAt.setMinutes(
      verificationCodeExpiresAt.getMinutes() + 1,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationCode: verificationCode,
        verificationCodeExpiresAt,
      },
    });

    // Send email
    await this.mailService.sendMail({
      email,
      subject: 'Verification Code',
      username,
      verificationCode: verificationCode,
      templatePath,
    });

    return verificationCode;
  }
}
