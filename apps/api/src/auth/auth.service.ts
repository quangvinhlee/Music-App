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
  VerifyResetPasswordDto,
  VerifyUserDto,
} from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import {
  GeoInfoResponse,
  LoginResponse,
  RegisterResponse,
} from './entities/auth.entities';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import * as requestIp from 'request-ip';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {}

  private usedTokens = new Set<string>(); // In-memory blacklist for used tokens

  async getCountryCodeByIp(req?: any): Promise<GeoInfoResponse> {
    try {
      let ip = '';

      // First try getting the IP from the request headers
      if (req) {
        ip =
          requestIp.getClientIp(req) ||
          req.connection?.remoteAddress ||
          req.socket?.remoteAddress ||
          req.ip ||
          '';
      }

      // If IP is local (localhost), get the real public IP using an external API
      if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
        ip = await this.getRealPublicIp();
      }

      // If there's no IP (still a fallback), use Google's public DNS server IP
      if (!ip) ip = '8.8.8.8'; // Fallback IP

      // Now fetch geolocation data from ipinfo.io
      const token = this.config.get<string>('IPINFO_TOKEN');
      if (!token) throw new Error('IPINFO token is missing');

      const response = await fetch(
        `https://api.ipinfo.io/lite/${ip}?token=${token}`,
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch IP info: ${response.statusText}`);
      }

      const data = await response.json();

      // Return the country and region or default values if private IP
      return {
        countryCode: data.country_code || 'US',
        countryName: data.country || 'United States',
      };
    } catch (error) {
      console.error('Error fetching country code:', error);
      return {
        countryCode: 'US',
        countryName: 'United States',
      };
    }
  }

  // Helper function to get real public IP
  async getRealPublicIp(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      if (!response.ok) throw new Error('Failed to fetch real IP');
      const data = await response.json();
      return data.ip || '8.8.8.8'; // Default to Google DNS if not found
    } catch (error) {
      console.error('Error fetching public IP:', error);
      return '8.8.8.8'; // Fallback to a public DNS IP
    }
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    const { email, password, confirmPassword, username } = registerDto;

    if (!email || !password || !confirmPassword || !username) {
      throw new HttpException(
        'Please fill in all required fields: email, password, confirm password, and username.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (password !== confirmPassword) {
      throw new HttpException(
        'The passwords you entered do not match. Please try again.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const lowerCaseEmail = email.toLowerCase();
    const lowerCaseUsername = username.toLowerCase();

    const existingEmailUser = await this.prisma.user.findUnique({
      where: { email: lowerCaseEmail },
    });

    if (existingEmailUser) {
      if (!existingEmailUser.isVerified) {
        await this.prisma.user.delete({
          where: { id: existingEmailUser.id },
        });
      } else {
        throw new HttpException(
          'User with this email already exists.',
          HttpStatus.CONFLICT,
        );
      }
    }

    const existingUsernameUser = await this.prisma.user.findUnique({
      where: { username: lowerCaseUsername },
    });

    if (existingUsernameUser) {
      throw new HttpException(
        'User with this username already exists.',
        HttpStatus.CONFLICT,
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await this.prisma.user.create({
      data: {
        email: lowerCaseEmail,
        password: hashedPassword as string,
        username: lowerCaseUsername,
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
      user: {
        ...newUser,
        avatar: undefined,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    if (!email || !password) {
      throw new HttpException(
        'Both email and password are required to log in. Please provide them.',
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

    if (!existingUser.isVerified) {
      throw new HttpException(
        'Your email address has not been verified. Please check your inbox for the verification email or register again with this email address.',
        HttpStatus.UNAUTHORIZED,
      );
    }

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
      expiresIn: '7d',
    });

    return {
      message: 'Login successful',
      token,
    };
  }

  async verifyUser(verifyUserDto: VerifyUserDto) {
    const { userId, verificationCode } = verifyUserDto;

    if (!userId || !verificationCode) {
      throw new HttpException(
        'Both user ID and verification code are required to verify your account.',
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
      throw new HttpException(
        'This email address has already been verified. No further action is required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (existingUser.verificationCode !== verificationCode) {
      throw new HttpException(
        'The verification code you entered is incorrect. Please check and try again.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      !existingUser.verificationCodeExpiresAt ||
      existingUser.verificationCodeExpiresAt < new Date()
    ) {
      throw new HttpException(
        'The verification code has expired. Please request a new one.',
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
    };
  }

  async resendVerification(resendVerificationDto: ResendVerificationDto) {
    const { userId } = resendVerificationDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException(
        'The user you are trying to verify does not exist. Please check the user ID and try again.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.isVerified) {
      throw new HttpException(
        'This email address has already been verified. No further action is required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const templatePath = 'src/mail/templates/verify-email.ejs';

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

    if (!email) {
      throw new HttpException(
        'Please provide your email address to reset your password.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpException(
        'No user found with the provided email address. Please check and try again.',
        HttpStatus.NOT_FOUND,
      );
    }

    const templatePath = 'src/mail/templates/forgot-password.ejs';

    const token = this.jwtService.sign(
      { email: user.email },
      {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: '1h',
      },
    );

    const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;

    await this.mailService.sendMail({
      email,
      subject: 'Verification Code',
      username: user.username,
      resetLink,
      templatePath,
    });

    return {
      message: 'Verification link sent successfully',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password, confirmPassword } = resetPasswordDto;

    if (!token || !password || !confirmPassword) {
      throw new HttpException(
        'Please provide all required fields: reset token, new password, and confirm password.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (this.usedTokens.has(token)) {
      throw new HttpException(
        'This password reset link has already been used. Please request a new one.',
        HttpStatus.BAD_REQUEST,
      );
    }

    let decodedToken;
    try {
      decodedToken = this.jwtService.verify(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
    } catch (err) {
      throw new HttpException(
        'Invalid or expired reset link.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: decodedToken.email },
    });

    if (!user) {
      throw new HttpException(
        'We could not find a user associated with this email address.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (password !== confirmPassword) {
      throw new HttpException(
        'The passwords you entered do not match. Please try again.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword as string,
      },
    });

    this.usedTokens.add(token);

    return {
      message:
        'Your password has been reset successfully. You can now log in with your new password.',
    };
  }

  async verifyToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
      return payload;
    } catch (error) {
      return null; // Return null if token is invalid or expired
    }
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
