import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UserModule } from './user/user.module';
import { AppService } from './app.service';
import { UserService } from './user/user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppResolver } from './app.resolver';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailModule } from './mail/mail.module';
import { MailService } from './mail/mail.service';
import { SongModule } from './song/song.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      context: ({ req, res }) => ({ req, res }), // Automatically generate schema
    }),
    ConfigModule.forRoot({ isGlobal: true }),

    UserModule,
    MailModule,
    SongModule,
  ],
  providers: [
    AppService,
    UserService,
    AppResolver,
    PrismaService,
    JwtService,
    MailService,
    ConfigService,
  ],
})
export class AppModule {}
