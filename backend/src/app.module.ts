import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from './prisma.service'
import { GameModule } from './game/game.module'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), GameModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
