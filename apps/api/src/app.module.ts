import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppResolver } from './app.resolver';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailModule } from './mail/mail.module';
import { MailService } from './mail/mail.service';
import { InteractModule } from './interact/interact.module';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { UserModule } from './user/user.module';
import { SoundcloudModule } from './soundcloud/soundcloud.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      context: ({ req, res }) => ({ req, res }), // Automatically generate schema
    }),
    ConfigModule.forRoot({ isGlobal: true }),

    AuthModule,
    MailModule,
    InteractModule,
    UserModule,
    SoundcloudModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthService,
    AppResolver,
    PrismaService,
    JwtService,
    MailService,
    ConfigService,
  ],
})
export class AppModule {}
